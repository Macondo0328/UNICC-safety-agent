
# AI Safety Agent – Automatic Safety Evaluation Framework

This project is an **AI Safety Assessment Framework** designed to evaluate the reliability and safety of AI agents.  
The system automatically generates contextual questions, runs dialogue tests, applies LLM-based safety scoring, and outputs a complete evaluation report across **six major safety dimensions**.

---

## 🧠 Core Concept

Unlike a traditional agent, this project functions as an **evaluation system**. It can:

1. Generate scenario-based multi-turn test questions
2. Interact with the target agent automatically
3. Evaluate responses using an LLM scoring rubric
4. Produce structured reports including module scores & final rating

Evaluation covers six safety modules:

| Module | Evaluation Focus |
|---|---|
| Integrity | Accuracy, hallucination avoidance, compliance with declared functionality |
| Robustness | Resistance to jailbreak, misleading instructions, noisy inputs |
| Ethics | Ethical compliance, bias prevention, harmful content detection |
| Privacy | PII handling, data leak prevention, identity inference safety |
| Humanitarian | Self-harm prevention, safety in crisis situations, non-violent guidance |
| Transparency | Self-identification as AI, citation honesty, no impersonation |

---

## 📁 Project Structure

```
safety_agent_v3/
├─ core/                # Orchestrator, evaluation logic, connectors
├─ modules/             # Scenario generation & multi-turn testing
├─ prompts/             # Rubrics, persona sets, scenario templates
├─ state/               # Data models for test results and dialogue
├─ results/             # Output JSON reports stored here
├─ api_server.py        # FastAPI backend entry point
├─ cli.py               # CLI runner to execute evaluation
└─ requirements.txt     # Python dependencies
```

Frontend UI project:

```
ai-safety-agent-ui/
├─ src/
│  ├─ pages/report      # Report visualization page
│  ├─ services          # API communication logic
│  ├─ components        # UI components and charts
└─ package.json
```

---

# 🚀 How to Run

### Step 1 – Start Backend (Python FastAPI)

Open **PowerShell / CMD window #1**
```powershell
cd D:\safety_agent_v3\safety_agent_v3   # Adjust path based on your installation
```

If using virtual env:
```powershell
.\.venv\Scripts\Activate.ps1
```

Run backend:
```powershell
uvicorn api_server:app --reload --port 8000
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
```

> Keep this window open.

---

### Step 2 – Start Frontend (UI Web App)

Open **a second PowerShell / CMD window**
```powershell
cd D:i-safety-agent-uii-safety-agent-ui
```

Install dependencies (first run only):
```powershell
npm install
```

Start frontend dev server:
```powershell
npm run dev
```

Open browser:
👉 http://localhost:5173/

---

## 🔎 Usage Flow

1. Enter your API Key in the UI
2. Select target agent (MIRROR, VeriMedia, etc.)
3. Click **Run Evaluation**
4. Wait 1–3 minutes for completion
5. View visualization report including:
   - Module scores & final score
   - Pass/Fail status
   - Full reasoning & dialogue logs

Reports are also saved as JSON under:

```
/results/{agent}_{timestamp}.json
```

---

## 🛠 Extend with Your Own Agent

Modify `core/connector.py`:

```python
class MyConnector(BaseConnector):
    def chat(self, prompt: str) -> str:
        return call_my_model(prompt)
```

Register under `get_agent()`:
```python
elif name == "my-agent":
    return MyConnector()
```

---

## 📌 Key Features

✔ Automated safety evaluation  
✔ Deductive scoring with transparency  
✔ Real scenario-based adversarial testing  
✔ Extensible agent connector architecture  
✔ Ready for academic or enterprise use  

---

## 🔮 Future Enhancements

- Multi-round contextual long conversations
- Built-in support for more LLM platforms
- PDF report export in UI
- Configurable scenario difficulty and custom test sets

---

### Made for AI Ethics Research and Safety Validation 💙

