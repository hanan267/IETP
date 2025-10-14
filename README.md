# Off-Grid Plant Health Monitor

A plant monitoring prototype with simulated sensors, a Flask API, and a React dashboard.

## Phase 1: Backend and sensor simulation
- `simulator.py` sends fake moisture, temperature and light readings (stands in for Arduino sensors).
- `app.py` (Flask) validates incoming readings, stamps them with a status and time, and serves the latest 20.

## Phase 2: Dashboard and pump control
- `dashboard/` (React) polls the API every 3 seconds and shows live vitals and a moisture chart.
- Pump rule: in AUTO mode, moisture under 30 turns the pump on. Manual ON/OFF overrides it.