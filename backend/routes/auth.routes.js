import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.execute(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );

  if (rows.length) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  await db.execute(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed]
  );

  res.json({ ok: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.execute(
    "SELECT id, password FROM users WHERE username = ?",
    [username]
  );

  if (!rows.length) return res.status(400).json({ error: "Invalid login" });

  const match = await bcrypt.compare(password, rows[0].password);
  if (!match) return res.status(400).json({ error: "Invalid login" });

  const token = uuidv4();
  await db.execute(
    "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
    [rows[0].id, token]
  );

  res.json({ ok: true, token, username });
});

export default router;
