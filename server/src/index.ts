import express from "express";
import { sendMessage } from "./sendMessage";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3020;

app.use(express.json());
app.use(cors());

app.post("/chat", async (req, res) => {
  sendMessage(req, res);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
