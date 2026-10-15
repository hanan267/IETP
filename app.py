from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types
from datetime import datetime

app = Flask(__name__)
CORS(app)
client = genai.Client()
readings = []

pump = {"on": False, "mode": "AUTO"}


@app.route("/readings", methods=["POST"])
def add_reading():

    data = request.get_json()
    if not data or "moisture" not in data or "temperature" not in data or "light" not in data:
      return jsonify({"error": "missing fields"}), 400 
    
    
    data["status"] = "needs water" if data["moisture"] < 30 else "ok"
    data["time"] = datetime.now().isoformat()

    if pump["mode"] == "AUTO":
        pump["on"] = data["moisture"] < 30
    
    readings.append(data)
    return jsonify({"ok": True}), 201 

@app.route("/readings", methods=["GET"])
def get_readings():
    return jsonify(readings[-20:])

@app.route("/diagnose", methods=["POST"])
def diagnose():

    file = request.files.get("image")
    if not file:
        return jsonify({"error": "no image"}), 400

    image_bytes = file.read()
    mode = request.form.get("mode", "health")
    prompt = PROMPTS.get(mode, PROMPTS["health"])
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[types.Part.from_bytes(data=image_bytes, mime_type=file.mimetype), prompt],
    )
    return jsonify({"diagnosis": response.text})

@app.route("/pump", methods=["GET"])
def get_pump():
    return jsonify(pump)

@app.route("/pump", methods=["POST"])
def set_pump():

    action = request.get_json().get("action")
    if action == "auto":
        pump["mode"] = "AUTO"
    elif action in ("on", "off"):
        pump["mode"] = "MANUAL"
        pump["on"] = action == "on"
    else:
        return jsonify({"error": "bad action"}), 400
    return jsonify(pump)

PROMPTS = {
    "health": "Is this plant healthy or diseased? Name the likely issue, give confidence low, medium or high, and two fixes. Under 80 words.",
    "identify": "Identify this plant: common name, scientific name, and one interesting fact. Under 60 words.",
    "care": "Give a short care guide for this plant: water, light, temperature. Under 80 words.",
    "nutrients": "Look for nutrient deficiency signs in this plant. Name the likely nutrient and a fertilizer fix. Under 80 words.",
    "growth": "Estimate the growth stage of this plant and what to expect next. Under 80 words.",
    "propagate": "Explain how to propagate this plant in 3 short steps. Under 80 words.",
}
if __name__ == "__main__":
    app.run(port=5000, debug=True)