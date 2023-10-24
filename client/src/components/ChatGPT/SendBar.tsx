import { KeyboardEventHandler, useRef } from "react";

import { ClearOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";

import Show from "./Show";
import React from "react";
import { OpenAIChatMessage } from "modelfusion";
import { Spin } from "antd";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
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

export const SEND_BAR_HEIGHT = 60;

export interface SendBarProps {
  loading: boolean;
  disabled: boolean;
  onSend: (message: OpenAIChatMessage) => void;
  onClear: () => void;
  onStop: () => void;
  inputText?: React.MutableRefObject<string>;
  placeholder?: string;
  hideClearBtn?: boolean;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
}

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
    if (props.inputText?.current) {
      props.inputText!.current = inputRef.current?.value || "";
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
        role: "user",
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
    <div
      style={{
        maxHeight: SEND_BAR_HEIGHT,
        minHeight: SEND_BAR_HEIGHT,
        height: SEND_BAR_HEIGHT,
      }}
    >
      <Show
        fallback={
          <div
            className="flex items-baseline justify-center gap-2 p-3 mt-2 text-lg rounded-md"
            style={{ backgroundColor: "#e5e7eb" }}
          >
            <span>Generating ...</span>
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
        <div className="flex gap-2">
          <textarea
            ref={inputRef!}
            className="flex-1 p-3 text-lg border-0 rounded-md resize-none focus:outline-none focus:ring focus:ring-opacity-0"
            style={{ outlineOffset: "2px" }}
            disabled={disabled}
            placeholder={props.placeholder}
            autoComplete="off"
            rows={1}
            onKeyDown={onKeydown}
            onInput={onInputAutoSize}
          />
          <Button title="Send" disabled={disabled} onClick={handleSend}>
            <SendOutlined />
          </Button>
          {!props.hideClearBtn && (
            <Button title="Clear" disabled={disabled} onClick={handleClear}>
              <ClearOutlined />
            </Button>
          )}
          {props.onSave && (
            <Button
              onClick={() => {
                props.onSave?.();
              }}
              title="Save"
              disabled={props.saveDisabled}
            >
              {props.saveLoading ? (
                <Spin className="w-4 h-4" />
              ) : (
                <SaveOutlined></SaveOutlined>
              )}
            </Button>
          )}
        </div>
      </Show>
    </div>
  );
};

export default SendBar;
