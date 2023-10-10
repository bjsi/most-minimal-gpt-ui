import { GithubOutlined } from "@ant-design/icons";
import { Layout, Space, Typography } from "antd";

const { Link } = Typography;

const { Header } = Layout;

export const HeaderBar = () => {
  return (
    <>
      <Header
        className="fixed flex items-center w-full h-12 inset-0 py-0 px-4"
        style={{ zIndex: 19, lineHeight: "48px", backgroundColor: "#001529" }}
      >
        <div className={"h-[100%] flex items-center"}>
          <Link href="/">
            <div className="text-3xl">MinimalGPT</div>
          </Link>
        </div>
        <Space className={"flex ml-auto h-full overflow-hidden"} size={0}>
          <span className={"flex ml-auto h-full overflow-hidden"}>
            <Link
              className={
                "flex items-center h-12 py-0 px-3 text-white cursor-pointer transition-all ease-out duration-300 hover:bg-[#252a3d]"
              }
              href="https://github.com/bjsi/most-minimal-gpt-ui"
              target="_blank"
            >
              <GithubOutlined />
            </Link>
          </span>
        </Space>
      </Header>
      <div className={"h-[48px]"} />
    </>
  );
};
