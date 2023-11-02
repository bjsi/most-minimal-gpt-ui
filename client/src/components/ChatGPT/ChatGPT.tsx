import React from "react";
import MessageItem from "./MessageItem";
import SendBar, { SEND_BAR_HEIGHT } from "./SendBar";
import { useChatGPT } from "./useChatGPT";
import { useReadLocalStorage } from "usehooks-ts";

import "highlight.js/styles/atom-one-dark.css";
import { HEADER_HEIGHT } from "../HeaderBar";
import { Alert } from "antd";

export const ChatGPT = () => {
  const {
    loading,
    disabled,
    messages,
    currentMessage,
    onSend,
    onClear,
    onStop,
  } = useChatGPT();

  const openAIAPIKey = useReadLocalStorage<{ key: string }>("openAIKey")?.key;

  return (
    <div
      className="overflow-hidden chat-wrapper"
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
      }}
    >
      <div
        className="w-[100%] overflow-y-auto flex flex-col items-center"
        style={{
          minHeight: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
          maxHeight: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
          height: `calc(100% - ${SEND_BAR_HEIGHT}px)`,
          overflowY: "auto",
        }}
      >
        <div className="max-w-[800px] h-[100%] box-border">
          <div className="w-[100%] max-h-[100%] h-[100%] pt-2 box-border">
            {messages.length === 0 && !openAIAPIKey ? (
              <div className="flex items-center justify-center mt-6">
                <Alert
                  className="text-lg"
                  type="info"
                  closable={false}
                  message="Click the settings button above to enter your OpenAI key."
                />
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageItem key={index} message={message} />
                ))}
                {currentMessage.current && (
                  <MessageItem
                    message={{
                      content: currentMessage.current,
                      role: "assistant",
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SendBar
        loading={loading}
        disabled={disabled}
        onSend={onSend}
        onClear={onClear}
        onStop={onStop}
      />
    </div>
  );
};
