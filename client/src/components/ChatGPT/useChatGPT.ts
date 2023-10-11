import { useEffect, useReducer, useRef, useState } from "react";
import { z } from "zod";
import ClipboardJS from "clipboard";

import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodSchema,
  readEventSourceStream,
  streamText,
} from "modelfusion";
import { throttle } from "./throttle";

const scrollDown = throttle(() => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}, 300);

export const useChatGPT = () => {
  const [, forceUpdate] = useReducer((x) => !x, false);
  const [messages, setMessages] = useState<OpenAIChatMessage[]>([]);
  const [disabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const controller = useRef<AbortController | null>(null);
  const currentMessage = useRef<string>("");

  const archiveCurrentMessage = () => {
    const content = currentMessage.current;
    currentMessage.current = "";
    setLoading(false);
    if (content) {
      setMessages((messages) => {
        return [
          ...messages,
          {
            content,
            role: "assistant",
          },
        ];
      });
      scrollDown();
    }
  };

  const fetchMessage = async (messages: OpenAIChatMessage[]) => {
    try {
      currentMessage.current = "";
      controller.current = new AbortController();
      setLoading(true);
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
        signal: controller.current.signal,
      });

      const textDeltas = readEventSourceStream({
        stream: response.body!,
        schema: new ZodSchema(z.string()),
      });

      for await (const textDelta of textDeltas) {
        currentMessage.current += textDelta;
        forceUpdate();
      }

      archiveCurrentMessage();
    } catch (e) {
      console.error(e);
      setLoading(false);
      return;
    }
  };

  const onStop = () => {
    if (controller.current) {
      controller.current.abort();
      archiveCurrentMessage();
    }
  };

  const onSend = (message: OpenAIChatMessage) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    fetchMessage(newMessages);
  };

  const onClear = () => {
    setMessages([]);
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
