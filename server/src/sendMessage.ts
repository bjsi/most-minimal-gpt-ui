import {
  OpenAIChatModel,
  createEventSourceStream,
  streamText,
} from "modelfusion";

import { Request, Response } from "express";

export const sendMessage = async (request: Request, response: Response) => {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: `Method ${request.method} not allowed. Only POST allowed.`,
    });
  }

  const { messages } = request.body;
  // const parsedData = requestSchema.safeParse(await request.json());

  // if (parsedData.success === false) {
  //   return response.status(400).json({
  //     error: `Could not parse content. Error: ${parsedData.error}`,
  //   });
  // }

  // forward the abort signal
  const controller = new AbortController();
  // request.signal.addEventListener("abort", () => controller.abort());

  // const messages = parsedData.data;

  const textStream = await streamText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
    [
      {
        system:
          "You are an AI chat bot. " +
          "Follow the user's instructions carefully. Respond using markdown.",
      },
      ...messages.map((message) =>
        message.role === "user"
          ? { user: message.content }
          : { ai: message.content }
      ),
    ],
    // forward the abort signal:
    { run: { abortSignal: controller.signal } }
  );
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Content-Encoding", "none");
  response.write(createEventSourceStream(textStream));
};
