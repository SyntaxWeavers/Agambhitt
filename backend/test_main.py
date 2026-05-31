import unittest
import json
import httpx
from fastapi.testclient import TestClient
from main import app, get_db, Base, engine, SessionLocal, HistoryLog
from sqlalchemy.orm import Session

# Setup clean database for testing
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

class TestAgamBhittBackend(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # We need a small mock topology
        cls.test_topology = {
            "nodes": [
                {"id": "External_C2", "type": "External", "tier": 5, "ip": "185.220.101.5"},
                {"id": "AppServer_Portal", "type": "AppServer", "tier": 2, "ip": "10.0.1.46"},
                {"id": "DB_Core_Banking", "type": "DB", "tier": 0, "ip": "10.0.0.5"}
            ],
            "edges": [
                {"src": "External_C2", "dst": "AppServer_Portal", "protocol": "HTTPS", "port": 443},
                {"src": "AppServer_Portal", "dst": "DB_Core_Banking", "protocol": "gRPC", "port": 50051}
            ]
        }
        cls.test_vulnerabilities = [
            {
                "node_id": "AppServer_Portal",
                "cve": "CVE-2023-38646",
                "severity": "Critical",
                "description": "Remote Code Execution vulnerability in portal server"
            }
        ]

    def setUp(self):
        db = SessionLocal()
        db.query(HistoryLog).delete()
        db.commit()
        db.close()

    def test_history_starts_empty(self):
        response = client.get("/history")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_endpoints_flow(self):
        # 1. Analyze topology
        analyze_req = {
            "topology": self.test_topology,
            "vulnerabilities": self.test_vulnerabilities,
            "historical_incidents": []
        }
        response = client.post("/analyze", json=analyze_req)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("attack_vectors", data)
        self.assertIn("graph_nodes", data)
        self.assertIn("graph_edges", data)
        self.assertTrue(len(data["attack_vectors"]) > 0)
        
        selected_vector = data["attack_vectors"][0]
        
        # 2. Generate playbook
        playbook_req = {
            "selected_attack_vector": selected_vector,
            "incident_description": "Observed spikes in database calls originating from AppServer_Portal without authorization logs."
        }
        response = client.post("/playbook", json=playbook_req)
        self.assertEqual(response.status_code, 200)
        playbook_data = response.json()
        self.assertIn("containment", playbook_data)
        self.assertIn("eradication", playbook_data)
        self.assertIn("recovery", playbook_data)
        self.assertIn("rca", playbook_data)
        self.assertIn("cacao_playbook", playbook_data)
        self.assertIn("remediation_script", playbook_data)

        # 3. Red Team simulation
        redteam_req = {
            "topology": self.test_topology,
            "vulnerabilities": self.test_vulnerabilities
        }
        response = client.post("/redteam", json=redteam_req)
        self.assertEqual(response.status_code, 200)
        redteam_data = response.json()
        self.assertIn("attack_chain", redteam_data)
        self.assertTrue(len(redteam_data["attack_chain"]) > 0)
        
        attack_chain = redteam_data["attack_chain"]

        # 4. Generate countermeasures
        countermeasures_req = {
            "attack_chain": attack_chain
        }
        response = client.post("/countermeasures", json=countermeasures_req)
        self.assertEqual(response.status_code, 200)
        countermeasures_data = response.json()
        self.assertIn("countermeasures", countermeasures_data)
        self.assertTrue(len(countermeasures_data["countermeasures"]) > 0)

        # 5. Verify History is populated
        response = client.get("/history")
        self.assertEqual(response.status_code, 200)
        history_data = response.json()
        self.assertTrue(len(history_data) >= 4)  # At least 4 POST calls made

if __name__ == "__main__":
    unittest.main()
