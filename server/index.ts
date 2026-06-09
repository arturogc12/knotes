import dotenv from "dotenv";
import express from "express";
import { handleChat } from "./chat.js";
import { handleExport } from "./export.js";
import { handleTranscribe } from "./transcribe.js";

dotenv.config({ path: ".env.local" });

const app = express();
const port = Number(process.env.PORT) || 3099;

app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", handleChat);
app.post("/api/transcribe", handleTranscribe);
app.post("/api/export", handleExport);

app.listen(port, () => {
  console.log(`API K-Notes escuchando en http://localhost:${port}`);
});
