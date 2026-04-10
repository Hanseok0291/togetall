"use client";

import { useEffect, useRef, useState } from "react";

const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim();

type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => object;
  Map: new (
    container: HTMLElement,
    options: { center: object; level: number },
  ) => {
    setCenter: (c: object) => void;
    relayout: () => void;
  };
  Marker: new (options: { position: object; map?: unknown }) => {
    setMap: (map: unknown | null) => void;
  };
};

export type KakaoMapMarker = { id: string; lat: number; lng: number; title: string };

function getMaps(): KakaoMapsApi | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { kakao?: { maps: KakaoMapsApi } }).kakao?.maps ?? null;
}

function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  return new Promise((resolve, reject) => {
    const afterScript = () => {
      const maps = getMaps();
      if (!maps) {
        reject(new Error("Kakao Maps unavailable"));
        return;
      }
      maps.load(() => resolve(maps));
    };

    if (getMaps()) {
      getMaps()!.load(() => resolve(getMaps()!));
      return;
    }

    const existing = document.getElementById("kakao-maps-sdk");
    if (existing) {
      if (getMaps()) {
        getMaps()!.load(() => resolve(getMaps()!));
        return;
      }
      existing.addEventListener("load", afterScript);
      existing.addEventListener("error", () => reject(new Error("script error")));
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.onload = afterScript;
    script.onerror = () => reject(new Error("script error"));
    document.head.appendChild(script);
  });
}

function computeCenter(markers: Pick<KakaoMapMarker, "lat" | "lng">[]): { lat: number; lng: number } {
  const seoul = { lat: 37.5665, lng: 126.978 };
  if (markers.length === 0) return seoul;
  const s = markers.reduce((a, m) => ({ lat: a.lat + m.lat, lng: a.lng + m.lng }), { lat: 0, lng: 0 });
  return { lat: s.lat / markers.length, lng: s.lng / markers.length };
}

type Props = { markers: KakaoMapMarker[] };

export function KakaoMap({ markers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ setCenter: (c: object) => void; relayout: () => void } | null>(null);
  const markerRefs = useRef<{ setMap: (m: unknown | null) => void }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const center = computeCenter(markers);
  const level = markers.length === 1 ? 5 : markers.length === 0 ? 8 : 7;
  const markersKey = markers.map((m) => m.id).sort().join(",");

  useEffect(() => {
    if (!APP_KEY) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = [];

    (async () => {
      try {
        const maps = await loadKakaoMaps(APP_KEY);
        if (cancelled || !containerRef.current) return;
        const c = new maps.LatLng(center.lat, center.lng);
        if (!mapRef.current) {
          mapRef.current = new maps.Map(containerRef.current, { center: c, level });
        } else {
          mapRef.current.setCenter(c);
        }
        for (const mk of markers) {
          const pos = new maps.LatLng(mk.lat, mk.lng);
          const marker = new maps.Marker({ position: pos, map: mapRef.current });
          markerRefs.current.push(marker);
        }
        mapRef.current.relayout();
        setLoadError(null);
      } catch {
        if (!cancelled) setLoadError("지도를 불러오지 못했습니다.");
      }
    })();

    return () => {
      cancelled = true;
      markerRefs.current.forEach((m) => m.setMap(null));
      markerRefs.current = [];
      mapRef.current = null;
    };
  }, [center.lat, center.lng, level, markersKey, markers]);

  if (!APP_KEY) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        카카오맵을 쓰려면 <code className="mx-1 rounded bg-amber-200/80 px-1.5 py-0.5 dark:bg-amber-900/80">NEXT_PUBLIC_KAKAO_MAP_APP_KEY</code>를{" "}
        <code className="rounded bg-amber-200/80 px-1.5 py-0.5 dark:bg-amber-900/80">web/.env.local</code>에 넣고, Kakao Developers 앱 플랫폼에 이 사이트 도메인을
        등록하세요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {loadError && <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>}
      <div
        ref={containerRef}
        className="h-[280px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        role="presentation"
      />
    </div>
  );
}
