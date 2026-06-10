import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";
import { handleExtractAbc } from "../server/extractAbc.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleExtractAbc(req as unknown as Request, res as unknown as Response);
}
