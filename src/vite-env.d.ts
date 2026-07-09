/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FB_APIKEY: string;
  readonly VITE_FB_APPID: string;
  readonly VITE_FB_AUTHDOMAIN: string;
  readonly VITE_FB_MSGSENDERID: string;
  readonly VITE_FB_PROJECTID: string;
  readonly VITE_FB_STORAGEBUCKET: string;
  readonly VITE_FB_FIRESTOREDATABASEID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
