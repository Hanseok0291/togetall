import { ImageResponse } from "next/og";

export const alt = "Treadmill Pace — pace per km to treadmill km/h";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>Treadmill Pace</div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 500,
          }}
        >
          Pace / km → treadmill speed (km/h)
        </div>
      </div>
    ),
    { ...size },
  );
}
