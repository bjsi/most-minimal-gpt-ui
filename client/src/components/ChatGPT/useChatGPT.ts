import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import * as ClipboardJS from "clipboard";

import { OpenAIChatMessage, readEventSourceStream } from "modelfusion";
import { throttle } from "./throttle";
import { ZodSchema } from "./ZodSchema";
import {
  partialCreateMealPlanSchema,
  partialRecipeSchema,
} from "shared-lib/src/ai/prompts/createMealPlan";

const scrollDown = throttle(() => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}, 300);

const useChatGPT = <StreamChunk>(props: {
  urlEndpoint: string;
  streamChunkSchema: z.ZodType<StreamChunk>;
  updateCurrentMessage: (chunk: {
    value: StreamChunk;
    isComplete: boolean;
  }) => StreamChunk | undefined;
}) => {
  const { urlEndpoint, streamChunkSchema, updateCurrentMessage } = props;
  const [messages, setMessages] = useState<OpenAIChatMessage[]>([]);
  const [disabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const controller = useRef<AbortController | null>(null);
  const [currentMessage, setCurrentMessage] = useState<
    StreamChunk | undefined
  >();

  async function sendChat(body: Record<string, unknown>) {
    try {
      setCurrentMessage(undefined);
      controller.current = new AbortController();
      setLoading(true);

      const response = await fetch(`http://localhost:3020/${urlEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.current.signal,
      });

      const streamChunks = readEventSourceStream({
        stream: response.body!,
        schema: new ZodSchema(
          z.object({
            chunk: z.object({
              isComplete: z.boolean(),
              value: streamChunkSchema,
            }),
          })
        ),
        errorHandler: (e) => {
          console.error(e);
        },
      }) as AsyncIterable<{
        chunk: { isComplete: boolean; value: StreamChunk };
      }>;

      for await (const { chunk } of streamChunks) {
        const updatedCurrentMessage = updateCurrentMessage(chunk);
        setCurrentMessage(updatedCurrentMessage);
      }

      setLoading(false);
      scrollDown();
    } catch (e) {
      if (e.name === "AbortError" || e instanceof DOMException) {
        console.log("cancelled");
        return;
      } else {
        console.error(e);
        setLoading(false);
        return;
      }
    }
  }

  const onStop = () => {
    if (controller.current) {
      controller.current.abort();
      setLoading(false);
      scrollDown();
    }
  };

  const onSend = (
    body: Record<string, unknown> & { message: OpenAIChatMessage }
  ) => {
    const newMessages = [...messages, body.message];
    setMessages(newMessages);
    sendChat(body);
  };

  const onClear = () => {
    setMessages([]);
    setCurrentMessage(undefined);
  };

  useEffect(() => {
    new ClipboardJS(".chat-wrapper .copy-btn");
  }, []);

  return {
    loading,
    disabled,
    messages,
    currentMessage,
    onSend,
    onClear,
    onStop,
  };
};

export const useGenerateMealPlan = () => {
  return useChatGPT({
    urlEndpoint: "create-meal-plan",
    streamChunkSchema: partialCreateMealPlanSchema,
    updateCurrentMessage: (chunk) => {
      return chunk.value;
    },
  });
};

export const useUpdateRecipe = () => {
  return useChatGPT({
    urlEndpoint: "update-recipe",
    streamChunkSchema: partialRecipeSchema,
    updateCurrentMessage: (chunk) => {
      return chunk.value;
    },
  });
};
