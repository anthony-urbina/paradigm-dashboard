import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(
    path.join(process.cwd(), "public", "Paradigm Financial Logo-16.png"),
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
          background: "#0e0f10",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orange accent glow top-center */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(241,80,37,0.18) 0%, transparent 65%)",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* Logo on a dark elevated card so white logo is visible */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1b1e",
            borderRadius: 32,
            padding: "48px 64px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(241,80,37,0.08)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Paradigm Financial"
            width={320}
            height={279}
          />
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.15)" }} />
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#6b7280",
              fontFamily: "sans-serif",
            }}
          >
            Agent Portal
          </span>
          <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
