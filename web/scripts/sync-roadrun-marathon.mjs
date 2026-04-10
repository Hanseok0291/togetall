#!/usr/bin/env node
/**
 * roadrun.co.kr 국내 대회 일정 → Supabase race_events 동기화 (HTML 크롤링, EUC-KR)
 *
 * 실행 (web 폴더 기준):
 *   cd web && node --env-file=.env.local ./scripts/sync-roadrun-marathon.mjs
 *
 * 환경 변수:
 *   NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY — 동기화 전용. Git·클라이언트에 넣지 마세요.
 * 선택:
 *   ROADRUN_YEAR — 기본: 올해(로컬 타임존)
 *   ROADRUN_MONTHS — 쉼표 구분, 예: 1,2,3. 비우면 1~12
 */

import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { guessRegion } from "./guess-race-region.mjs";

const BASE = "http://www.roadrun.co.kr/schedule";
const LIST_URL = `${BASE}/list.php`;

function requireEnv(primary, ...fallbacks) {
  for (const name of [primary, ...fallbacks]) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  console.error(
    `Missing required env: ${primary}${fallbacks.length ? ` (or ${fallbacks.join(", ")})` : ""}`,
  );
  process.exit(1);
}

function parseMonths() {
  const raw = process.env.ROADRUN_MONTHS?.trim();
  if (!raw) return Array.from({ length: 12 }, (_, i) => i + 1);
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => n >= 1 && n <= 12);
}

function parseYear() {
  const y = process.env.ROADRUN_YEAR?.trim();
  if (y) {
    const n = Number.parseInt(y, 10);
    if (n >= 2000 && n <= 2100) return n;
  }
  return new Date().getFullYear();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchListHtml(year, month) {
  const url = new URL(LIST_URL);
  url.searchParams.set("year", String(year));
  url.searchParams.set("month", String(month));

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; TogetallRaceSync/1.0; +https://github.com/)",
      Accept: "text/html,*/*",
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`roadrun HTTP ${res.status} ${month}월: ${t.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return iconv.decode(buf, "euc-kr");
}

/**
 * @param {string} html
 * @param {number} year
 * @param {number} month 1-12
 */
function parseRows(html, year, month) {
  const $ = cheerio.load(html);
  const out = [];

  $("table tr").each((_, tr) => {
    const tds = $(tr).children("td");
    if (tds.length < 4) return;

    const dateText = $(tds[0]).text().replace(/\s+/g, " ").trim();
    const dm = dateText.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
    if (!dm) return;
    const md = Number.parseInt(dm[1], 10);
    const dd = Number.parseInt(dm[2], 10);
    if (md !== month) return;

    const raceDate = `${year}-${String(month).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;

    const cell1 = $(tds[1]);
    const link = cell1.find('a[href*="view.php"]').first();
    const href = link.attr("href") ?? "";
    const noM = href.match(/view\.php\?no=(\d+)/);
    if (!noM) return;
    const no = noM[1];
    const name = link.text().replace(/\s+/g, " ").trim();
    if (!name) return;

    const coursesEl = cell1.find('font[size="2"]').first();
    const coursesRaw = coursesEl.text().replace(/\s+/g, " ").trim();
    const courses = coursesRaw && coursesRaw !== name ? coursesRaw : null;

    const address = $(tds[2]).text().replace(/\s+/g, " ").trim() || null;

    const organizerCell = $(tds[3]);
    const orgText = organizerCell.text().replace(/\s+/g, " ").trim();
    const phoneM = orgText.match(/☎\s*([\d\-]+)/);
    const phone = phoneM ? phoneM[1].trim() : null;
    const organizer = orgText.split("☎")[0].trim() || null;

    const detailUrl = `${BASE}/view.php?no=${no}`;

    out.push({
      external_uid: `roadrun:no=${no}`,
      name,
      race_date: raceDate,
      address,
      lat: null,
      lng: null,
      url: detailUrl,
      organizer,
      courses,
      phone,
      region: guessRegion(address ?? "", name),
      registration_status: null,
      source: "roadrun",
    });
  });

  return out;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const year = parseYear();
  const months = parseMonths();
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const all = [];
  for (const m of months) {
    let html;
    try {
      html = await fetchListHtml(year, m);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    const rows = parseRows(html, year, m);
    console.log(`${year}년 ${m}월: ${rows.length}건 파싱`);
    all.push(...rows);
    await sleep(400);
  }

  const seen = new Map();
  for (const r of all) {
    seen.set(r.external_uid, r);
  }
  const batch = [...seen.values()];

  if (batch.length === 0) {
    console.log("저장할 행이 없습니다.");
    return;
  }

  const chunkSize = 150;
  for (let i = 0; i < batch.length; i += chunkSize) {
    const chunk = batch.slice(i, i + chunkSize);
    const { error } = await supabase.from("race_events").upsert(chunk, {
      onConflict: "external_uid",
    });
    if (error) {
      console.error("Supabase upsert error:", error.message);
      process.exit(1);
    }
  }

  console.log(`race_events에 ${batch.length}건 upsert 완료 (source=roadrun, ${year}년).`);
}

main();
