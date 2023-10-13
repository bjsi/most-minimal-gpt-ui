import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { AbortError, OpenAIChatModel, streamText } from "modelfusion";

dotenv.config();

const app = express();
const port = 3020;

app.use(express.json());
app.use(cors());

const requestSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })
);

app.post("/chat", async (request, response) => {
  try {
    console.log("sendMessage");
    if (request.method !== "POST") {
      return response.status(405).json({
        error: `Method ${request.method} not allowed. Only POST allowed.`,
      });
    }

    const { messages } = request.body;
    console.log(messages);
    const parsedData = requestSchema.safeParse(messages);

    if (parsedData.success === false) {
      return response.status(400).json({
        error: `Could not parse content. Error: ${parsedData.error}`,
      });
    }

    const controller = new AbortController();

    const textStream = await streamText(
      new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
      [
        {
          role: "system",
          content:
            "You are an AI chat bot. " +
            "Follow the user's instructions carefully. Respond using markdown.",
        },
        ...parsedData.data,
      ],
      // forward the abort signal:
      { run: { abortSignal: controller.signal } }
    );
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    response.on("close", () => {
      controller.abort();
      console.log("response closed");
    });

    for await (const textDelta of textStream) {
      console.log(textDelta);
      response.write(`data: ${JSON.stringify({ textDelta })}\n\n`);
    }

    response.end();
  } catch (e) {
    if (e instanceof AbortError) {
      console.log("client aborted request");
      response.end();
      return;
    } else {
      console.log("error", e);
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
