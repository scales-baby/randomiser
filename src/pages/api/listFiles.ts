// pages/api/listFiles.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const directoryPath = path.join(process.cwd(), "public");
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".json"));

  res.status(200).json({ files });
}
