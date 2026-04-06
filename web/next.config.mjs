import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

/** @type {import("next").NextConfig} */
const nextConfig = {
  // 앱 루트(web)를 고정해 Turbopack이 상위 디렉터리(예: git 루트)를 프로젝트 루트로 잡지 않게 함
  outputFileTracingRoot: rootDir,
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
