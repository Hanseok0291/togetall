import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(import.meta.url);

function getLightningcssVersion() {
  try {
    // `lightningcss` itself is installed before `postinstall` runs.
    return require("lightningcss/package.json").version;
  } catch {
    return null;
  }
}

function getLinuxVariant() {
  // Matches how `lightningcss/node/index.js` decides which binary to load.
  const arch = process.arch;
  const platform = process.platform;
  if (platform !== "linux") return null;

  let parts = [platform, arch];
  const { MUSL, familySync } = require("detect-libc");
  const family = familySync();

  if (family === MUSL) parts.push("musl");
  else if (arch === "arm") parts.push("gnueabihf");
  else parts.push("gnu");

  return `lightningcss-${parts.join("-")}`;
}

function canRequire(name) {
  try {
    require(name);
    return true;
  } catch {
    return false;
  }
}

const variant = getLinuxVariant();
if (!variant) process.exit(0);

if (canRequire(variant)) process.exit(0);

const version = getLightningcssVersion();
if (!version) {
  console.warn(
    `[ensure-lightningcss-native] Could not read lightningcss version; skipping install of ${variant}.`,
  );
  process.exit(0);
}

try {
  execSync(`npm i --no-save ${variant}@${version}`, { stdio: "inherit" });
} catch (err) {
  console.error(
    `[ensure-lightningcss-native] Failed to install ${variant}@${version}.`,
  );
  throw err;
}

if (!canRequire(variant)) {
  throw new Error(
    `[ensure-lightningcss-native] Installed ${variant}@${version} but still cannot require it.`,
  );
}

