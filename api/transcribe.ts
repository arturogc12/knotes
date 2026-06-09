import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";
import { handleTranscribe } from "../server/transcribe.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return handleTranscribe(req as unknown as Request, res as unknown as Response);
}
