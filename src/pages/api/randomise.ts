// pages/api/randomize.ts
import type { NextApiRequest, NextApiResponse } from "next";
import randomSeed from "random-seed";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { seed, count, filename } = req.query;

  if (!seed || !count || !filename) {
    res.status(400).json({ error: "Seed, count, and filename are required" });
    return;
  }

  const filePath = path.join(process.cwd(), "public", `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const usernames = JSON.parse(fileContent);

  const rand = randomSeed.create(seed as string);
  const shuffled = [...usernames].sort(() => rand.random() - 0.5);
  const selectedUsers = shuffled.slice(0, parseInt(count as string));

  res.status(200).json({ users: selectedUsers });
}
