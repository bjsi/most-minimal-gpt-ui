import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import {
  AbortError,
  OpenAIApiConfiguration,
  OpenAIChatModel,
  streamText,
} from "modelfusion";
import { chatAs } from "shared-lib/src/data/search";

dotenv.config();

const app = express();
const port = 3020;

app.use(express.json());
app.use(cors());

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const chatSchema = z.object({
  messages: z.array(messageSchema),
  openAIKey: z.string().min(1),
});

const returnError = (response: Response, type: string, message: string) => {
  response.status(400).json({
    type,
    message,
  });
};

async function streamRequestHandler(
  request: Request,
  response: Response,
  streamFn: (signal: AbortSignal) => Promise<AsyncIterable<string>>
) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({
        error: `Method ${request.method} not allowed. Only POST allowed.`,
      });
    }

    const controller = new AbortController();
    const textStream = await streamFn(controller.signal);

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    response.on("close", () => {
      controller.abort();
      console.log("response closed");
    });

    for await (const textDelta of textStream) {
      response.write(`data: ${JSON.stringify({ textDelta })}\n\n`);
    }

    response.end();
  } catch (e) {
    if (e instanceof AbortError) {
      console.log("client aborted request");
      response.end();
    } else {
      returnError(
        response,
        "server-error",
        (e as any).message ?? "An unknown error occurred."
      );
    }
  }
}

app.post("/chat", async (request, response) => {
  const parsedData = chatSchema.safeParse(request.body);
  if (parsedData.success === false) {
    return returnError(
      response,
      "key-missing",
      "OpenAI key is missing, or is invalid. Check the settings page."
    );
  }
  streamRequestHandler(request, response, (signal) =>
    streamText(
      new OpenAIChatModel({
        model: "gpt-3.5-turbo",
        temperature: 0,
        api: new OpenAIApiConfiguration({ apiKey: parsedData.data.openAIKey }),
      }),
      [
        {
          role: "system",
          content:
            "You are an AI chat bot. " +
            "Follow the user's instructions carefully. Respond using markdown.",
        },
        ...parsedData.data.messages,
      ],
      {
        run: {
          abortSignal: signal,
        },
      }
    )
  );
});

const chatAsSchema = z.object({
  openAIKey: z.string().min(1),
  personality: z.union([z.literal("David Deutsch"), z.literal("Karl Popper")]),
  messages: z.array(messageSchema),
});

app.post("/chatAs", async (request, response) => {
  const parsedData = chatAsSchema.safeParse(request.body);
  if (parsedData.success === false) {
    return returnError(
      response,
      "key-missing",
      "OpenAI key is missing, or is invalid. Check the settings page."
    );
  }
  streamRequestHandler(request, response, (signal) =>
    chatAs({
      ...parsedData.data,
      signal,
      openAIKey: parsedData.data.openAIKey,
    })
  );
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
