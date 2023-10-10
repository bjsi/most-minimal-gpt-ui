import { Layout } from "antd";

import VersionBar from "./VersionBar";

const { Footer } = Layout;

export const FooterBar = () => {
  return (
    <Footer className={"my-6 p-0 text-center"}>
      <VersionBar className={"flex justify-center mt-auto py-2 px-5 text-xs"} />
    </Footer>
  );
};
