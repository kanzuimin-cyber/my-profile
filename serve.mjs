// 自己紹介ページ用のローカルサーバー
// このフォルダのプロフィール(.txt)を開くたびに読み直し、index.html に渡す。npm install は不要。

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findProfileFile, loadProfile } from "./profile.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 3001);

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "text/plain; charset=utf-8", "Method Not Allowed");
    }
    if (pathname === "/" || pathname === "/index.html") {
      return send(res, 200, "text/html; charset=utf-8", await readFile(path.join(DIR, "index.html")));
    }
    if (pathname === "/profile.json") {
      return send(res, 200, "application/json; charset=utf-8", JSON.stringify(await loadProfile(DIR)));
    }
    send(res, 404, "text/plain; charset=utf-8", "Not Found");
  } catch (err) {
    console.error(err.message);
    send(res, 500, "application/json; charset=utf-8", JSON.stringify({ message: err.message }));
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") console.error(`ポート ${PORT} はすでに使われています。すでに起動していないか確認してください。`);
  else console.error(err);
  process.exit(1);
});

server.listen(PORT, HOST, async () => {
  console.log(`自己紹介ページを起動しました: http://localhost:${PORT}`);
  try {
    console.log(`プロフィール: ${await findProfileFile(DIR)}`);
  } catch (err) {
    console.error(err.message);
  }
  console.log("プロフィールの .txt を書き換えたら、ブラウザを再読み込みすると反映されます。");
  console.log("終了するには、この画面で Ctrl+C を押してください。");
});
