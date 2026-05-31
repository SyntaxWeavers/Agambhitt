# AgamBhitt Backend POC

FastAPI backend for network topology analysis, attack prediction, and simulation using local AI.

## Requirements
- Python 3.10+
- Ollama running `granite4.1:3b`

## Setup

1. **Install dependencies**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn pydantic networkx requests httpx sqlalchemy
   ```

2. **Ensure Ollama is running with the correct model**:
   ```bash
   ollama run granite4.1:3b
   ```

## Running the Server

Start the API server:
```bash
./venv/bin/uvicorn main:app --reload
```
The interactive API documentation will be available at http://localhost:8000/docs.

## API Endpoints

- **POST `/analyze`**: Identifies likely attack vectors from network topology, vulnerability data, and incidents.
- **POST `/playbook`**: Generates containment, eradication, and recovery plans for an attack vector.
- **POST `/redteam`**: Generates a simulated attack chain mapped to MITRE ATT&CK.
- **POST `/countermeasures`**: Proposes detection and mitigation controls for an attack chain.
- **GET `/history`**: Retrieves audit logs of all previous analyses.

## Running Tests

Verify the backend and LLM integration:
```bash
./venv/bin/python -m unittest test_main.py
```
