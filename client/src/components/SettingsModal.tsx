import { useState } from "react";
import { Modal, Button, Form, Input } from "antd";
import React from "react";
import { SettingOutlined } from "@ant-design/icons";
import { useLocalStorage } from "usehooks-ts";
import clsx from "clsx";

export type APIKey = {
  key: string | undefined;
};

export function SettingsModal() {
  const [visible, setVisible] = useState(false);
  const [openAIKey, setOpenAIKey] = useLocalStorage<APIKey>("openAIKey", {
    key: undefined,
  });
  const [elevenlabsKey, setElevenlabsKey] = useLocalStorage<APIKey>(
    "elevenlabsKey",
    { key: undefined }
  );

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <Button
        className={clsx("flex items-center justify-center")}
        onClick={handleOpen}
      >
        <SettingOutlined className={clsx(!openAIKey.key && "animate-bounce")} />
      </Button>
      <Modal
        title="Settings"
        open={visible}
        onCancel={handleClose}
        onOk={handleClose}
      >
        <Form layout="vertical">
          <Form.Item label="OpenAI Key">
            <div>
              Find your key in your{" "}
              <a href="https://beta.openai.com/account/api-keys">
                Open AI user settings page.
              </a>
            </div>
            <Input
              value={openAIKey?.key}
              placeholder="Enter your OpenAI API Key"
              onChange={(e) => setOpenAIKey({ key: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Eleven Labs Key">
            <div>Eleven Labs is a text-to-speech service. It's optional.</div>
            <div>
              To find your key{" "}
              <a href="https://elevenlabs.io/speech-synthesis">log in</a>, click
              your profile icon and select "Profile".{" "}
            </div>
            <Input
              value={elevenlabsKey?.key}
              placeholder="Enter your ElevenLabs API Key (optional)"
              onChange={(e) => setElevenlabsKey({ key: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
