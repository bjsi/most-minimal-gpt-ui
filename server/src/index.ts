import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import {
  OpenAIChatModel,
  OpenAIImageGenerationModel,
  generateImage,
  streamText,
} from "modelfusion";
import {
  createMealPlan,
  createMealPlanSchema,
  extractIngredients,
  recipeSchema,
  updateRecipe,
} from "shared-lib";

dotenv.config();

const app = express();
const port = 3020;

app.use(express.json());
app.use(cors());

const chatMessagesSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })
);

async function streamRequestHandler(
  request: Request,
  response: Response,
  streamFn: (signal: AbortSignal) => Promise<AsyncIterable<any>>
) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({
        error: `Method ${request.method} not allowed. Only POST allowed.`,
      });
    }

    const controller = new AbortController();
    const stream = await streamFn(controller.signal);

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    response.on("close", () => {
      controller.abort();
      console.log("response closed");
    });

    for await (const chunk of stream) {
      const data = JSON.stringify({ chunk });
      console.log(data);
      response.write(`data: ${data}\n\n`);
    }

    response.end();
  } catch (e) {
    if ((e as any).name === "AbortError") {
      console.log("client aborted request");
      response.end();
    } else {
      console.log("error", e);
    }
  }
}

app.post("/chat", async (request, response) => {
  const { messages } = request.body;
  const parsedData = chatMessagesSchema.safeParse(messages);
  if (parsedData.success === false) {
    return response.status(400).json({
      error: `Could not parse content. Error: ${parsedData.error}`,
    });
  }
  streamRequestHandler(request, response, (signal) =>
    streamText(
      new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
      [
        {
          role: "system",
          content:
            "You are an AI chat bot. " +
            "Follow the user's instructions carefully. Respond using markdown.",
        },
        ...request.body.messages,
      ],
      {
        run: {
          abortSignal: signal,
        },
      }
    )
  );
});

app.post("/create-meal-plan", async (request, response) => {
  const parsedData = z
    .object({
      requirements: z.string(),
    })
    .safeParse(request.body);
  if (parsedData.success === false) {
    return response.status(400).json({
      error: `Could not parse content. Error: ${parsedData.error}`,
    });
  }
  streamRequestHandler(request, response, (signal) =>
    createMealPlan(parsedData.data, true, signal)
  );
});

const updateMealPlanSchema = z.object({
  mealPlan: z.string(),
  feedback: z.string(),
});

app.post("/update-recipe", async (request, response) => {
  const parsedData = updateMealPlanSchema.safeParse(request.body);
  if (parsedData.success === false) {
    return response.status(400).json({
      error: `Could not parse content. Error: ${parsedData.error}`,
    });
  }
  streamRequestHandler(request, response, (signal) =>
    updateRecipe(parsedData.data, true, signal)
  );
});

app.post("/generate-image", async (request, response) => {
  const body = request.body;
  const parsedData = z.object({ prompt: z.string() }).safeParse(body);
  if (parsedData.success === false) {
    return response.status(400).json({
      error: `Could not parse content. Error: ${parsedData.error}`,
    });
  }
  const prompt = parsedData.data.prompt;
  console.log("Generating image with prompt:", prompt);
  try {
    const imageBuffer = await generateImage(
      new OpenAIImageGenerationModel({
        n: 1,
        size: "256x256",
      }),
      prompt
    );
    response.send(imageBuffer);
  } catch (e) {
    console.log(e);
    response.status(500).json({ error: e });
  }
});

app.post("/extract-ingredients", async (request, response) => {
  const body = request.body;
  const parsedData = z.object({ mealPlans: z.string() }).safeParse(body);
  if (parsedData.success === false) {
    return response.status(400).json({
      error: `Could not parse content. Error: ${parsedData.error}`,
    });
  }
  try {
    const ingredients = await extractIngredients(
      { mealPlans: parsedData.data.mealPlans },
      false
    );
    return response.json(ingredients);
  } catch (e) {
    console.log(e);
    response.status(500).json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
