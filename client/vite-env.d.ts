/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly YOUTUBE_CHANNEL_NAME: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
