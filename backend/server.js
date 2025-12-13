import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import initSocket from "./socket/index.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🚀 ConvoHub Backend running on ${PORT}`)
);
