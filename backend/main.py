import os
import json
import networkx as nx
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from datetime import datetime

# SQLAlchemy Setup for History Storage
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./agambhitt.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class HistoryLog(Base):
    __tablename__ = "history_logs"
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    request_payload = Column(Text)
    response_payload = Column(Text)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas for Request/Response Validation

class NodeInfo(BaseModel):
    id: str
    type: str
    tier: Optional[int] = None
    ip: Optional[str] = None

class EdgeInfo(BaseModel):
    src: str
    dst: str
    protocol: Optional[str] = None
    port: Optional[int] = None
    bytes: Optional[int] = None
    method: Optional[str] = None
    status: Optional[int] = None

class Topology(BaseModel):
    nodes: List[NodeInfo]
    edges: List[EdgeInfo]

class Vulnerability(BaseModel):
    node_id: str
    cve: str
    severity: str
    description: str

class Incident(BaseModel):
    node_id: str
    description: str
    timestamp: Optional[int] = None

class AnalyzeRequest(BaseModel):
    topology: Topology
    vulnerabilities: List[Vulnerability] = []
    historical_incidents: List[Incident] = []

class AttackVector(BaseModel):
    vector_id: str
    name: str
    path: List[str]
    severity: str
    likelihood: str
    business_impact: str
    mitre_attack_mappings: List[str]
    description: str

class AnalyzeResponse(BaseModel):
    attack_vectors: List[AttackVector]
    graph_nodes: List[Dict[str, Any]]
    graph_edges: List[Dict[str, Any]]

class PlaybookRequest(BaseModel):
    selected_attack_vector: AttackVector
    incident_description: str

class PlaybookResponse(BaseModel):
    containment: List[str]
    eradication: List[str]
    recovery: List[str]
    rca: str
    cacao_playbook: Dict[str, Any]
    remediation_script: str
    script_risks: List[str]

class RedTeamRequest(BaseModel):
    topology: Topology
    vulnerabilities: List[Vulnerability] = []

class AttackChainStep(BaseModel):
    phase: str  # Initial Access, Privilege Escalation, Lateral Movement, Collection, Exfiltration
    src_node: str
    dst_node: str
    technique: str
    mitre_id: str
    description: str

class RedTeamResponse(BaseModel):
    attack_chain: List[AttackChainStep]

class CountermeasuresRequest(BaseModel):
    attack_chain: List[AttackChainStep]

class Countermeasure(BaseModel):
    type: str  # Detection, Mitigation, Preventive, Monitoring
    description: str
    target_node: str
    details: str

class CountermeasuresResponse(BaseModel):
    countermeasures: List[Countermeasure]

# FastAPI Application
app = FastAPI(title="AgamBhitt Attack Prediction & Simulation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API_URL = "http://localhost:11434/api/chat"

async def call_ollama(prompt: str, response_format: Dict[str, Any]) -> Dict[str, Any]:
    payload = {
        "model": "granite4.1:3b",
        "messages": [
            {"role": "system", "content": "You are a cyber security expert backend assistant. You must respond ONLY with a valid JSON object matching the requested schema. Do not output any markdown formatting, code block markers (like ```json), or explanatory text outside the JSON object itself."},
            {"role": "user", "content": prompt}
        ],
        "format": response_format,
        "options": {
            "temperature": 0.1
        },
        "stream": False
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(OLLAMA_API_URL, json=payload)
            if res.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Ollama server returned status code {res.status_code}")
            response_json = res.json()
            content = response_json.get("message", {}).get("content", "").strip()
            
            # Clean up potential markdown formatting if any escaped despite the system prompt
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()

            return json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse JSON response from local LLM: {str(e)}. Content received was: {content[:200]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with local LLM: {str(e)}")

# Endpoint 1: Attack Prediction Engine
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_topology(req: AnalyzeRequest, db: Session = Depends(get_db)):
    # 1. Build network topology using NetworkX
    G = nx.DiGraph()
    for node in req.topology.nodes:
        G.add_node(node.id, type=node.type, tier=node.tier, ip=node.ip)
    for edge in req.topology.edges:
        G.add_edge(edge.src, edge.dst, protocol=edge.protocol, port=edge.port)

    # More comprehensive path search covering lateral movements, insider threat origins, and intermediate systems
    potential_paths = []
    nodes_list = list(G.nodes())
    for src in nodes_list:
        for dst in nodes_list:
            if src != dst:
                try:
                    # Find paths with a max cutoff of 4
                    paths = list(nx.all_simple_paths(G, source=src, target=dst, cutoff=4))
                    for path in paths[:3]:
                        potential_paths.append(path)
                except Exception:
                    pass

    # Build prompt context
    topology_summary = {
        "nodes": [{"id": n, "type": G.nodes[n].get("type"), "tier": G.nodes[n].get("tier"), "ip": G.nodes[n].get("ip")} for n in G.nodes()],
        "edges": [{"src": u, "dst": v, "protocol": G.edges[u, v].get("protocol"), "port": G.edges[u, v].get("port")} for u, v in G.edges()],
        "extracted_sample_paths": potential_paths[:40]
    }
    
    prompt = f"""
    You are an automated penetration tester and network risk analyst. Analyze the following network topology and vulnerability/incident data to identify possible attack vectors:
    
    Topology:
    {json.dumps(topology_summary, indent=2)}
    
    Vulnerabilities:
    {json.dumps([v.model_dump() for v in req.vulnerabilities], indent=2)}
    
    Historical Incidents:
    {json.dumps([i.model_dump() for i in req.historical_incidents], indent=2)}
    
    Identify potential attack vectors (ranked by severity, high to low), detailing the exact path (list of node IDs), severity (Critical, High, Medium, Low), likelihood (High, Medium, Low), estimated business impact, corresponding MITRE ATT&CK mapping tags (e.g. T1190, T1078), and a descriptive summary.
    
    CRITICAL: You must detect lateral movement paths (e.g., intermediate Microservices, AppServers, DBs talking to each other) and insider threats starting from internal User or Admin Panel tiers, not just paths originating from external sources.
    
    
    Return the result strictly conforming to this JSON format:
    {{
      "attack_vectors": [
        {{
          "vector_id": "VEC-001",
          "name": "Describe the vector name",
          "path": ["NodeA", "NodeB", "NodeC"],
          "severity": "High",
          "likelihood": "Medium",
          "business_impact": "High business disruption or data breach",
          "mitre_attack_mappings": ["T1190", "T1068"],
          "description": "Detailed explanation of the attack sequence"
        }}
      ]
    }}
    """
    
    schema = {
        "type": "object",
        "properties": {
            "attack_vectors": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "vector_id": {"type": "string"},
                        "name": {"type": "string"},
                        "path": {"type": "array", "items": {"type": "string"}},
                        "severity": {"type": "string"},
                        "likelihood": {"type": "string"},
                        "business_impact": {"type": "string"},
                        "mitre_attack_mappings": {"type": "array", "items": {"type": "string"}},
                        "description": {"type": "string"}
                    },
                    "required": ["vector_id", "name", "path", "severity", "likelihood", "business_impact", "mitre_attack_mappings", "description"]
                }
            }
        },
        "required": ["attack_vectors"]
    }
    
    llm_res = await call_ollama(prompt, schema)
    
    # Standardize graph nodes and edges to return to client
    graph_nodes = [{"id": n, **G.nodes[n]} for n in G.nodes()]
    graph_edges = [{"source": u, "target": v, **G.edges[u, v]} for u, v in G.edges()]
    
    response = AnalyzeResponse(
        attack_vectors=llm_res.get("attack_vectors", []),
        graph_nodes=graph_nodes,
        graph_edges=graph_edges
    )
    
    # Store history
    db_log = HistoryLog(
        endpoint="/analyze",
        request_payload=req.model_dump_json(),
        response_payload=response.model_dump_json()
    )
    db.add(db_log)
    db.commit()
    
    return response

# Endpoint 2: Remediation Playbook Generator
@app.post("/playbook", response_model=PlaybookResponse)
async def generate_playbook(req: PlaybookRequest, db: Session = Depends(get_db)):
    prompt = f"""
    You are an Incident Response specialist. Generate a detailed, step-by-step remediation playbook for the following attack vector and incident context:
    
    Attack Vector details:
    {json.dumps(req.selected_attack_vector.model_dump(), indent=2)}
    
    Incident Description:
    {req.incident_description}
    
    Provide:
    1. Containment actions (immediate steps to stop the threat)
    2. Eradication actions (steps to remove the threat root cause, patch, or configure securely)
    3. Recovery actions (restoring systems safely to production)
    4. Root Cause Analysis (RCA) explaining why/how it occurred.
    5. A valid CACAO 2.0 (OASIS security playbook standard) formatted JSON object under 'cacao_playbook' that outlines the workflow steps and shell commands to perform containment/mitigation.
    6. An executable shell remediation script (Bash) under 'remediation_script' to automate the containment actions (e.g. using iptables, docker, or systemctl).
    
    Return the response strictly in this JSON format:
    {{
      "containment": ["Step 1", "Step 2"],
      "eradication": ["Step 1", "Step 2"],
      "recovery": ["Step 1", "Step 2"],
      "rca": "Detailed root cause analysis explanation",
      "cacao_playbook": {{
         "type": "playbook",
         "spec_version": "cacao-2.0",
         "id": "playbook--1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
         "name": "Containment Playbook",
         "description": "CACAO playbook for containment...",
         "playbook_types": ["mitigation"],
         "workflow_start": "step--start-uuid",
         "workflow": {{
            "step--start-uuid": {{
               "type": "action",
               "name": "Firewall Rule",
               "commands": [
                  {{
                     "type": "bash",
                     "command": "iptables -A INPUT ..."
                  }}
               ]
            }}
         }}
      }},
      "remediation_script": "#!/bin/bash\\n...",
      "script_risks": ["Risk 1: Potential downtime of services", "Risk 2: Potential database lock"]
    }}
    """
    
    schema = {
        "type": "object",
        "properties": {
            "containment": {"type": "array", "items": {"type": "string"}},
            "eradication": {"type": "array", "items": {"type": "string"}},
            "recovery": {"type": "array", "items": {"type": "string"}},
            "rca": {"type": "string"},
            "cacao_playbook": {"type": "object"},
            "remediation_script": {"type": "string"},
            "script_risks": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["containment", "eradication", "recovery", "rca", "cacao_playbook", "remediation_script", "script_risks"]
    }
    
    llm_res = await call_ollama(prompt, schema)
    
    response = PlaybookResponse(
        containment=llm_res.get("containment", []),
        eradication=llm_res.get("eradication", []),
        recovery=llm_res.get("recovery", []),
        rca=llm_res.get("rca", ""),
        cacao_playbook=llm_res.get("cacao_playbook", {}),
        remediation_script=llm_res.get("remediation_script", ""),
        script_risks=llm_res.get("script_risks", [])
    )
    
    # Store history
    db_log = HistoryLog(
        endpoint="/playbook",
        request_payload=req.model_dump_json(),
        response_payload=response.model_dump_json()
    )
    db.add(db_log)
    db.commit()
    
    return response

# Endpoint 3: Red Team Simulator
@app.post("/redteam", response_model=RedTeamResponse)
async def simulate_redteam(req: RedTeamRequest, db: Session = Depends(get_db)):
    prompt = f"""
    You are acting as a simulated Red Team attacker. Analyze this topology and set of vulnerabilities:
    
    Topology:
    {json.dumps([n.model_dump() for n in req.topology.nodes], indent=2)}
    
    Connections:
    {json.dumps([e.model_dump() for e in req.topology.edges], indent=2)}
    
    Vulnerabilities:
    {json.dumps([v.model_dump() for v in req.vulnerabilities], indent=2)}
    
    Simulate a progressive cyber attack. Break down the simulation into sequential steps (the attack chain).
    For each step, outline:
    - Phase: one of "Initial Access", "Privilege Escalation", "Lateral Movement", "Collection", "Exfiltration"
    - Src Node: Source host/asset
    - Dst Node: Destination/target host/asset
    - Technique: Technique name (e.g. Exploit Public-Facing Application, Remote Services)
    - MITRE ID: Corresponding ID (e.g. T1190, T1021)
    - Description: How the step was executed in the context of the vulnerabilities.
    
    Return the response strictly in this JSON format:
    {{
      "attack_chain": [
        {{
          "phase": "Initial Access",
          "src_node": "External_Node",
          "dst_node": "Internal_Node",
          "technique": "Exploit Public-Facing Application",
          "mitre_id": "T1190",
          "description": "Description of the step"
        }}
      ]
    }}
    """
    
    schema = {
        "type": "object",
        "properties": {
            "attack_chain": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "phase": {"type": "string"},
                        "src_node": {"type": "string"},
                        "dst_node": {"type": "string"},
                        "technique": {"type": "string"},
                        "mitre_id": {"type": "string"},
                        "description": {"type": "string"}
                    },
                    "required": ["phase", "src_node", "dst_node", "technique", "mitre_id", "description"]
                }
            }
        },
        "required": ["attack_chain"]
    }
    
    llm_res = await call_ollama(prompt, schema)
    
    response = RedTeamResponse(
        attack_chain=llm_res.get("attack_chain", [])
    )
    
    # Store history
    db_log = HistoryLog(
        endpoint="/redteam",
        request_payload=req.model_dump_json(),
        response_payload=response.model_dump_json()
    )
    db.add(db_log)
    db.commit()
    
    return response

# Endpoint 4: Defensive Response Generator
@app.post("/countermeasures", response_model=CountermeasuresResponse)
async def generate_countermeasures(req: CountermeasuresRequest, db: Session = Depends(get_db)):
    prompt = f"""
    You are a Blue Team Defensive Architect. Propose defensive countermeasures for each step of the following simulated attack chain:
    
    Attack Chain:
    {json.dumps([step.model_dump() for step in req.attack_chain], indent=2)}
    
    For each step or phase, recommend defensive countermeasures. Categorize each countermeasure as: "Detection", "Mitigation", "Preventive", or "Monitoring". Specify the target node and detailed description of the defensive control.
    
    Return the response strictly in this JSON format:
    {{
      "countermeasures": [
        {{
          "type": "Preventive",
          "description": "Configure Firewall Rule",
          "target_node": "TargetNodeID",
          "details": "Details on how to block traffic or fix the configuration"
        }}
      ]
    }}
    """
    
    schema = {
        "type": "object",
        "properties": {
            "countermeasures": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string"},
                        "description": {"type": "string"},
                        "target_node": {"type": "string"},
                        "details": {"type": "string"}
                    },
                    "required": ["type", "description", "target_node", "details"]
                }
            }
        },
        "required": ["countermeasures"]
    }
    
    llm_res = await call_ollama(prompt, schema)
    
    response = CountermeasuresResponse(
        countermeasures=llm_res.get("countermeasures", [])
    )
    
    # Store history
    db_log = HistoryLog(
        endpoint="/countermeasures",
        request_payload=req.model_dump_json(),
        response_payload=response.model_dump_json()
    )
    db.add(db_log)
    db.commit()
    
    return response

# Endpoint 5: History & Audit Logs
@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    logs = db.query(HistoryLog).order_by(HistoryLog.timestamp.desc()).all()
    history = []
    for log in logs:
        try:
            req_payload = json.loads(log.request_payload)
        except Exception:
            req_payload = log.request_payload
            
        try:
            res_payload = json.loads(log.response_payload)
        except Exception:
            res_payload = log.response_payload
            
        history.append({
            "id": log.id,
            "endpoint": log.endpoint,
            "timestamp": log.timestamp.isoformat(),
            "request": req_payload,
            "response": res_payload
        })
    return history
