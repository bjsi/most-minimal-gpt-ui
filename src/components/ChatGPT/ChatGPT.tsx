import { ChatRole } from "./interface";
import MessageItem from "./MessageItem";
import SendBar from "./SendBar";
import { useChatGPT } from "./useChatGPT";

import "highlight.js/styles/atom-one-dark.css";

export interface ChatGPTProps {}

export const ChatGPT = (props: ChatGPTProps) => {
  const {
    loading,
    disabled,
    messages,
    currentMessage,
    onSend,
    onClear,
    onStop,
  } = useChatGPT(props);

  return (
    <div className="w-[100%] ">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
      {currentMessage.current && (
        <MessageItem
          message={{
            content: currentMessage.current,
            role: ChatRole.Assistant,
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
