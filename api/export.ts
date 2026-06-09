import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";
import { handleExport } from "../server/export.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleExport(req as unknown as Request, res as unknown as Response);
}
