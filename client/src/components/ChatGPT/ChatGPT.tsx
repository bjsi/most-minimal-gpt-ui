import React from "react";
import MessageItem from "./MessageItem";
import SendBar from "./SendBar";
import { useChatGPT } from "./useChatGPT";

import "highlight.js/styles/atom-one-dark.css";

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

  return (
    <div className="w-[100%] chat-wrapper">
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
