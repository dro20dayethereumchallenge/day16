const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Readable } = require("stream");
const dotenv = require("dotenv");
const pinataSDK = require("@pinata/sdk");

dotenv.config();
const app = express();

if (process.env.CORS_ORIGIN) {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN.split(","),
    })
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
console.log("process.env.PINATA_JWT",process.env.PINATA_JWT)
//const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY
});

app.get("/api/ok", (_req, res) => res.json({ ok: true }));

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    if (req.file.mimetype !== "image/jpeg") {
      return res.status(400).json({ error: "Only .jpg (image/jpeg) allowed" });
    }

    const stream = Readable.from(req.file.buffer);
    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: req.body?.name || req.file.originalname || "upload.jpg" },
    });

    const cid = result.IpfsHash;
    const gateway = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";
    res.json({
      cid,
      ipfsUri: `ipfs://${cid}`,
      gatewayUrl: `${gateway}/ipfs/${cid}`,
      pinata: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
