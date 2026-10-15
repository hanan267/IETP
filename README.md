# Off-Grid Plant Health Monitor

A plant monitoring prototype: simulated sensors and camera, a Flask API, Gemini-powered plant analysis, and a React dashboard.

## How it works
- `simulator.py` sends fake moisture, temperature and light readings (stands in for Arduino sensors).
- `camera_simulator.py` sends a plant photo (stands in for an ESP32-CAM).
- `app.py` (Flask) validates and stores readings, runs the pump rule (moisture under 30 turns the pump on in AUTO mode), and calls the Gemini API.
- `dashboard/` (React) shows live vitals, pump controls, photo analysis with 6 AI modules, and a follow-up chat.

## Run it
1. `pip install flask flask-cors requests google-genai`
2. `set GEMINI_API_KEY=your_key` then `python app.py`
3. `python simulator.py` and `python camera_simulator.py`
4. `cd dashboard`, `npm install`, `npm run dev`

## Limitations
Hardware is simulated, data is stored in memory, and there is no authentication. Next steps: SQLite storage, real device integration, and accuracy testing.