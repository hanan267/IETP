import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000";
const MODULES = ["health", "identify", "care", "nutrients", "growth", "propagate"];

function App() {
  const [readings, setReadings] = useState([]);
  const [pump, setPump] = useState({ on: false, mode: "AUTO" });
  const [camera, setCamera] = useState({ has_image: false, time: null });
  const [source, setSource] = useState("upload");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("health");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [log, setLog] = useState(["System initialized..."]);

  const addLog = (msg) =>
    setLog((prev) => [...prev.slice(-5), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/readings`).then((r) => r.json()).then(setReadings);
      fetch(`${API}/pump`).then((r) => r.json()).then(setPump);
      fetch(`${API}/camera`).then((r) => r.json()).then(setCamera);
    };
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, []);

  const latest = readings[readings.length - 1];
  const hasImage = source === "upload" ? !!file : camera.has_image;

  const sendPump = async (action) => {
    const res = await fetch(`${API}/pump`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setPump(await res.json());
    addLog(`Pump command: ${action}`);
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setResult("");
    setChat([]);
  };

  const runModule = async () => {
    setLoading(true);
    setChat([]);
    const formData = new FormData();
    formData.append("mode", mode);
    if (source === "upload") formData.append("image", file);
    const res = await fetch(`${API}/diagnose`, { method: "POST", body: formData });
    const data = await res.json();
    setResult(data.diagnosis || data.error);
    setLoading(false);
    addLog(`${mode} scan complete (${source})`);
  };

  const sendChat = async () => {
    if (!question.trim()) return;
    const history = chat;
    setChat([...chat, { role: "You", text: question }]);
    setQuestion("");
    setChatLoading(true);
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question, history }),
    });
    const data = await res.json();
    setChat((prev) => [...prev, { role: "AI", text: data.reply || data.error }]);
    setChatLoading(false);
  };

    return (
    <div className="app">
      <div className="sidebar">
        <h2>OFF-GRID INTELLIGENCE</h2>
        <h4>WATER PUMP CONTROL</h4>
        <div className="btn-row">
          <button onClick={() => sendPump("on")}>Pump on</button>
          <button className="off" onClick={() => sendPump("off")}>Pump off</button>
        </div>
        <button onClick={() => sendPump("auto")}>Auto mode</button>

        <h4>AI MODULES</h4>
        <div className="grid">
          {MODULES.map((m) => (
            <button key={m} className={`mod ${m} ${m === mode ? "active" : ""}`} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>

        <pre>{log.join("\n")}</pre>
      </div>

      <div className="main">
        <div className="panel">
          <h4>SPECIMEN FEED</h4>
          <div className="btn-row">
            <button className={source === "upload" ? "" : "off"} onClick={() => setSource("upload")}>Upload</button>
            <button className={source === "camera" ? "" : "off"} onClick={() => setSource("camera")}>Device camera</button>
          </div>

          <div className="feed">
            {source === "upload" && (file
              ? <img src={URL.createObjectURL(file)} alt="plant" />
              : <span>Choose a photo...</span>)}
            {source === "camera" && (camera.has_image
              ? <img src={`${API}/latest-image?t=${camera.time}`} alt="plant" />
              : <span>Waiting for scan...</span>)}
          </div>

          {source === "upload" && <input type="file" accept="image/*" onChange={handleFile} />}
          {source === "camera" && camera.time && <p>Captured: {new Date(camera.time).toLocaleTimeString()}</p>}

          {hasImage && (
            <>
              <p>Module: {mode}</p>
              <button onClick={runModule} disabled={loading}>Analyse</button>
            </>
          )}
        </div>

        <div className="panel">
          <h4>VITALS</h4>
          <div className="bars">
            {readings.map((r, i) => (
              <div key={i} className={r.moisture < 30 ? "bar low" : "bar"} style={{ height: r.moisture + "%" }} />
            ))}
          </div>
          <div className="stats">
            <div className="stat"><b>{latest ? latest.moisture + "%" : "--"}</b><span>MOISTURE</span></div>
            <div className="stat"><b>{latest ? latest.temperature + "°C" : "--"}</b><span>TEMPERATURE</span></div>
            <div className="stat"><b>{latest ? new Date(latest.time).toLocaleTimeString() : "--"}</b><span>LAST UPDATE</span></div>
            <div className="stat"><b>{pump.mode}</b><span>PUMP MODE ({pump.on ? "RUNNING" : "idle"})</span></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h4>AI ANALYSIS RESULT</h4>
            <span className="badge">GEMINI 2.5 FLASH</span>
          </div>
          {loading && <p>Analyzing...</p>}
          <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>

          {result && (
            <div className="chat">
              <h4>ASK A FOLLOW-UP</h4>
              {chat.map((m, i) => (
                <p key={i}><b>{m.role}:</b> {m.text}</p>
              ))}
              {chatLoading && <p>Thinking...</p>}
              <input
                type="text"
                value={question}
                placeholder="e.g. How often should I water it?"
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button onClick={sendChat} disabled={chatLoading}>Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default App;