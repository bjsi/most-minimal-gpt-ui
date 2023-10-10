import { KeyboardEventHandler, useRef } from "react";

import { ClearOutlined, SendOutlined } from "@ant-design/icons";

import { ChatRole, SendBarProps } from "./interface";
import Show from "./Show";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function Button(props: ButtonProps) {
  const { children, ...rest } = props;
  return (
    <button
      className="h-12 px-3 py-0 text-lg bg-gray-200 border border-transparent rounded-md cursor-pointer active:bg-gray-300"
      style={{ minWidth: "3rem" }}
      {...rest}
    >
      {children}
    </button>
  );
}

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
      onClear();
    }
  };

  const handleSend = () => {
    const content = inputRef.current?.value;
    if (content) {
      inputRef.current!.value = "";
      inputRef.current!.style.height = "auto";
      onSend({
        content,
        role: ChatRole.User,
      });
    }
  };

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.shiftKey) {
      return;
    }

    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  return (
    <Show
      fallback={
        <div
          className="flex gap-2 items-baseline justify-center mt-2 p-3 text-lg rounded-md"
          style={{ backgroundColor: "#e5e7eb" }}
        >
          <span>Please wait ...</span>
          <div
            className="px-3 py-0 text-sm rounded-md cursor-pointer"
            style={{ border: "1px solid #282c34" }}
            onClick={onStop}
          >
            Stop
          </div>
        </div>
      }
      loading={loading}
    >
      <div className="flex gap-2 mt-2">
        <textarea
          ref={inputRef!}
          className="flex-1 p-3 text-lg border-0 rounded-md resize-none focus:outline-none focus:ring focus:ring-opacity-0"
          style={{ outlineOffset: "2px" }}
          disabled={disabled}
          placeholder="Shift + Enter for new line"
          autoComplete="off"
          rows={1}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />
        <Button title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined />
        </Button>
        <Button title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined />
        </Button>
      </div>
    </Show>
  );
};

export default SendBar;
