import { Layout } from "antd";
import { ChatGPT } from "./components/ChatGPT/ChatGPT";
import { HeaderBar } from "./components/HeaderBar";
import React from "react";

import "antd/dist/antd.css";

function App() {
  return (
    <Layout>
      <HeaderBar />
      <ChatGPT />
    </Layout>
  );
}

export default App;
