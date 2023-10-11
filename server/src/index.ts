import express from "express";
import { OpenAIChatModel, streamText } from "modelfusion";

const app = express();
const port = 3020;

app.use(express.json());

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  const controller = new AbortController();

  sendMessage(messages, controller.signal);
  const textStream = await streamText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
    messages,
    {
      run: {
        abortSignal: controller.signal,
      },
    }
  );

  for await (const text of textStream) {
  }

  console.log(`Received message: ${messages}`);
  res.send("Message received");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
