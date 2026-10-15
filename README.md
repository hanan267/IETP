# 🌱 Off-Grid Plant Health Monitor

A full-stack plant monitoring prototype: simulated sensors feed a Flask API, a React dashboard shows live data, and the Gemini vision API analyses plant photos.

> Hardware (Arduino sensors, camera, pump relay) is **simulated** with Python scripts. A real device would call the same endpoints.

## Features
- 📡 Live vitals (moisture, temperature, light) with a 3-second refresh and a moisture bar chart
- 💧 Pump automation: in AUTO mode, moisture under 30% turns the pump on; manual ON/OFF overrides it
- 🤖 Gemini photo analysis with 6 modules: health, identify, care, nutrients, growth, propagate
- 💬 Follow-up chat that answers questions about the analysed photo
- 📷 Photo input from an upload or a device camera feed
- 🖥️ Terminal-style activity log

## Architecture
```
simulator.py ──POST /readings──▶  Flask API (app.py)  ◀──GET (every 3s)── React dashboard
camera feed  ──POST /capture───▶       │                                       │
                                       ├── pump rule (moisture < 30)           │
                                       └── Gemini API ◀── /diagnose, /chat ────┘
```

## Tech stack
Python, Flask, Flask-CORS, React (Vite), Google Gemini API (`gemini-2.5-flash`)

## API
| Method | Route | What it does |
|---|---|---|
| POST | `/readings` | Validates and stores a sensor reading (400 if fields are missing) |
| GET | `/readings` | Returns the latest 20 readings |
| GET / POST | `/pump` | Reads the pump state / sets `on`, `off` or `auto` |
| POST | `/diagnose` | Runs the chosen AI module on a photo |
| POST | `/chat` | Answers a follow-up question about the last analysed photo |

## Design decisions
- **Server owns the pump state**, so every client sees the same truth.
- **Gemini is called from the backend**, so the API key never reaches the browser.
- **One endpoint, six prompts**: modules are a dictionary of prompts, so adding one is a single line.
- **Polling over WebSockets**: simpler, and fine at a 3-second rate.

## Run it
1. `pip install flask flask-cors requests google-genai`
2. `set GEMINI_API_KEY=your_key`, then `python app.py`
3. In a second terminal: `python simulator.py`
4. In a third: `cd dashboard`, `npm install`, `npm run dev`

## Limitations and next steps
- Readings are stored in memory and reset on restart, so the next step is SQLite
- No authentication, and one shared photo for all users
- AI diagnoses are a first opinion, not verified, so accuracy would need testing against labeled plant images
- Replace the simulators with a real ESP32 and camera module

## Phase 1: Backend and sensor simulation
- `simulator.py` sends fake moisture, temperature and light readings (stands in for Arduino sensors).
- `app.py` (Flask) validates incoming readings, stamps them with a status and time, and serves the latest 20.

## Phase 2: Dashboard and pump control
- `dashboard/` (React) polls the API every 3 seconds and shows live vitals and a moisture chart.
- Pump rule: in AUTO mode, moisture under 30 turns the pump on. Manual ON/OFF overrides it.

## Phase 3: Gemini AI analysis
- Upload a plant photo, pick one of 6 AI modules (health, identify, care, nutrients, growth, propagate), and press Analyse.
- A follow-up chat answers questions about the same photo using the earlier analysis as context.

## Phase 4: Setup and limitations
Run it:
1. `pip install flask flask-cors requests google-genai`
2. `set GEMINI_API_KEY=your_key`, then `python app.py`
3. `python simulator.py`
4. `cd dashboard`, `npm install`, `npm run dev`

