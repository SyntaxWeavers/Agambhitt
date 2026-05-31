# AgamBhitt: The Autonomous Cyber Security Overseer

**AgamBhitt** (Sanskrit for *Impenetrable Foundation*) is an autonomous, on-premise cybersecurity orchestrator designed to protect financial infrastructure. By combining Graph Neural Networks (GNN) with Generative AI, AgamBhitt acts as a real-time "Digital Twin" of a bank's security posture to predict lateral attack paths and deploy self-healing countermeasures.

---

## 🛡️ Tri-Layered Defense Architecture

1. **The Wall (Contextual WAF):** An inline, Transformer-based Web Application Firewall (RoBERTa/DistilBERT) analyzing the semantic intent of requests to block zero-day exploits and polymorphic payloads.
2. **The Eyes (Predictive Graph Intelligence):** A Graph Neural Network (GNN) mapping users, configurations, and permissions into a Heterogeneous Graph to identify hidden lateral threat paths.
3. **The Brain (Agentic Orchestration):** An on-premise Large Language Model (LLM) analyzing incidents, mapping them to the MITRE ATT&CK framework, and executing CACAO-compliant self-healing scripts (Ansible/Terraform).

---

## 🛠️ Technology Stack

* **Frontend:** React + Vite, Tailwind CSS, Interactive Network Topology Graph
* **Backend API:** FastAPI, SQLAlchemy, NetworkX, Uvicorn
* **AI/ML Core:** PyTorch Geometric (GNNs), HuggingFace (WAF), local Ollama/vLLM (Granite 4.1 / Llama 3)
* **Databases:** SQLite (Audit History), PostgreSQL + `pgvector` (Log Embeddings), Neo4j (Topology Graph)
* **Automation:** Ansible, Terraform

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have Python 3.12+, Node.js (v18+), and Ollama running locally.
```bash
# Pull the default local LLM
ollama pull granite4.1:3b
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # Or install fastapi uvicorn sqlalchemy networkx httpx pydantic
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access the interactive dashboard.

---

## 📂 Project Structure

* `/frontend` — React dashboard and attack topology viewer
* `/backend` — FastAPI server, local LLM integrations, and audit logs database
* `/docs` — Original hackathon presentation PDFs and slides summary
* `/datasets` — Synthetic network topology and vulnerability logs
