import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";
import { handleChat } from "../server/chat.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return handleChat(req as unknown as Request, res as unknown as Response);
}
