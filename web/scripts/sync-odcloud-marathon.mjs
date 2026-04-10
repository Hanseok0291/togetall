#!/usr/bin/env node
/**
 * 문화체육관광부 국내마라톤대회 정보 → Supabase race_events 동기화 (odcloud.kr OpenAPI)
 *
 * 실행 (web 폴더 기준, 로컬 비밀은 .env.local에만):
 *   cd web && node --env-file=.env.local ./scripts/sync-odcloud-marathon.mjs
 *
 * 필요 환경 변수:
 *   OD_CLOUD_SERVICE_KEY 또는 DATA_GO_KR_SERVICE_KEY — 공공데이터포털 활용신청 Encoding 인증키
 *   NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY — 서비스 롤(동기화 전용). Git·클라이언트에 넣지 마세요.
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { guessRegion } from "./guess-race-region.mjs";

const ODCLOUD_PATH = "/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3";

function requireEnv(primary, ...fallbacks) {
  for (const name of [primary, ...fallbacks]) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  console.error(`Missing required env: ${primary}${fallbacks.length ? ` (or ${fallbacks.join(", ")})` : ""}`);
  process.exit(1);
}

function stableUid(row) {
  const parts = [row["대회명"], row["대회일시"], row["대회장소"], row["주최"]].map((x) => String(x ?? ""));
  const s = parts.join("|");
  return `odcloud:${crypto.createHash("sha256").update(s, "utf8").digest("hex")}`;
}

function parseDate(raw) {
  const t = String(raw ?? "").trim();
  const m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

async function fetchAllPages(serviceKey) {
  const baseHost = "https://api.odcloud.kr";
  const rows = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL(baseHost + ODCLOUD_PATH);
    url.searchParams.set("page", String(page));
    url.searchParams.set("perPage", String(perPage));
    url.searchParams.set("serviceKey", serviceKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`odcloud HTTP ${res.status}: ${t.slice(0, 400)}`);
    }

    const json = await res.json();
    const chunk = Array.isArray(json.data) ? json.data : [];
    rows.push(...chunk);

    const total = Number(json.totalCount ?? json.matchCount ?? rows.length);
    if (chunk.length < perPage) break;
    if (page * perPage >= total) break;
    page += 1;
  }

  return rows;
}

async function main() {
  const serviceKey = requireEnv("OD_CLOUD_SERVICE_KEY", "DATA_GO_KR_SERVICE_KEY");
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let raw;
  try {
    raw = await fetchAllPages(serviceKey);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const batch = [];
  for (const row of raw) {
    const name = String(row["대회명"] ?? "").trim();
    const race_date = parseDate(row["대회일시"]);
    const address = String(row["대회장소"] ?? "").trim() || null;
    const courses = String(row["종목"] ?? "").trim() || null;
    const organizer = String(row["주최"] ?? "").trim() || null;
    if (!name || !race_date) continue;

    batch.push({
      external_uid: stableUid(row),
      name,
      race_date,
      address,
      lat: null,
      lng: null,
      url: null,
      organizer,
      courses,
      phone: null,
      region: guessRegion(address ?? "", name),
      registration_status: null,
      source: "odcloud",
    });
  }

  if (batch.length === 0) {
    console.log("No rows to upsert (API empty or unparsable).");
    return;
  }

  const { error } = await supabase.from("race_events").upsert(batch, { onConflict: "external_uid" });

  if (error) {
    console.error("Supabase upsert error:", error.message);
    process.exit(1);
  }

  console.log(`Upserted ${batch.length} row(s) into race_events (source=odcloud).`);
}

main();
