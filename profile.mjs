// プロフィール(.txt)の読み取り処理。serve.mjs と build-netlify.mjs の両方で使う。

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// プロフィールの .txt を探す(複数あるときは名前順で最初のもの)
export async function findProfileFile(dir) {
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".txt")).sort();
  if (files.length === 0) throw new Error("プロフィールの .txt ファイルが見つかりません");
  return path.join(dir, files[0]);
}

// .txt を探して読み取り、ページに渡す形にする
export async function loadProfile(dir) {
  return parseProfile(await readFile(await findProfileFile(dir), "utf8"));
}

// 「# 名前」「## 見出し」「- 箇条書き」の形式を読み取る
export function parseProfile(text) {
  const profile = { name: "", sections: [] };
  let current = null;
  for (const raw of text.replace(/^﻿/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    if (/^#\s+/.test(line) && !/^##/.test(line)) {
      profile.name = line.replace(/^#\s+/, "").trim();
    } else if (/^##\s+/.test(line)) {
      current = { title: line.replace(/^##\s+/, "").trim(), paragraphs: [], items: [] };
      profile.sections.push(current);
    } else if (current && /^[-*・]\s*/.test(line)) {
      current.items.push(parseItem(line.replace(/^[-*・]\s*/, "")));
    } else if (current) {
      current.paragraphs.push(line);
    }
  }
  return profile;
}

// 箇条書き1行を { label, value, kind } にする。「GitHub：https://...」のような「名前：値」にも対応する
export function parseItem(text) {
  let label = "";
  let value = text.trim();
  const m = /^([^：]*)：\s*(.*)$/.exec(value) ?? /^([^:]*?):\s+(.*)$/.exec(value);
  if (m) {
    label = m[1].trim();
    value = m[2].trim();
  }
  let kind = "text";
  if (/^https?:\/\//.test(value)) kind = "url";
  else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) kind = "email";
  // 「https://...」のような書きかけの値は、リンクにせず「準備中」として扱う
  const placeholder = value === "" || /\.\.\.|…/.test(value) || /^https?:\/\/$/.test(value);
  return { label, value, kind, placeholder };
}
