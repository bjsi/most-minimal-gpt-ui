import { Layout } from "antd";
import { ChatGPT } from "./components/ChatGPT/ChatGPT";
import { HeaderBar } from "./components/HeaderBar";
import { Content } from "antd/lib/layout/layout";
import { FooterBar } from "./components/FooterBar";

function App() {
  return (
    <Layout hasSider className={"w-full min-h-full"}>
      <Layout>
        <HeaderBar />
        <Content className={"flex flex-col m-2"}>
          <ChatGPT />
        </Content>
        <FooterBar />
      </Layout>
    </Layout>
  );
}

export default App;
