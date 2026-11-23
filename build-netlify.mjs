// Netlify 公開用のファイルを netlify フォルダに作る
// 使い方: node build-netlify.mjs
// netlify フォルダには index.html と profile.json だけが入る(.txt を書き換えたら再実行する)

import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findProfileFile, loadProfile } from "./profile.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "netlify");

const profile = await loadProfile(DIR);

// 古いファイルが残らないように作り直す
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT);
await copyFile(path.join(DIR, "index.html"), path.join(OUT, "index.html"));
await writeFile(path.join(OUT, "profile.json"), JSON.stringify(profile), "utf8");

console.log(`プロフィール: ${await findProfileFile(DIR)}`);
console.log(`作成しました: ${OUT}`);
console.log("  index.html");
console.log("  profile.json");
