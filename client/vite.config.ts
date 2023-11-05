import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import dotenv from "dotenv";
import path from "path";

const envFile = path.resolve("../../../.env");
console.log("envFile", envFile);

dotenv.config({
  path: envFile,
});

console.log(process.env);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __YOUTUBE_CHANNEL_NAME__: `"${process.env.YOUTUBE_CHANNEL_NAME}"`,
  },
});
