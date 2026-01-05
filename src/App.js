import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
    setStatus("");
    setResult(null);
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus("Choose a .jpg first.");
    if (file.type !== "image/jpeg") return setStatus("Only .jpg allowed.");

    setStatus("Uploading to Pinata…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);

      const url = "http://ec2-34-215-15-117.us-west-2.compute.amazonaws.com:3001/api/upload";

      const res = await fetch(url, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setStatus("Uploaded!");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
            };

  return (
    <div style={{ maxWidth: 540, margin: "4rem auto", fontFamily: "system-ui" }}>
      <h1>Upload a .jpg to Pinata (IPFS)</h1>

      <form onSubmit={upload} style={{ display: "grid", gap: 12 }}>
        <input type="file" accept="image/jpeg" onChange={onPick} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        )}
        <button type="submit" disabled={!file}>Upload</button>
      </form>

      <p style={{ marginTop: 12 }}>{status}</p>

      {result && (
        <div style={{ marginTop: 16 }}>

          <div><strong>CID:</strong> {result.cid}</div>
          <div><strong>ipfs://</strong> {result.ipfsUri}</div>
          <div>
            <strong>Gateway:</strong>{" "}
            <a href={result.gatewayUrl} target="_blank" rel="noreferrer">
              {result.gatewayUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
