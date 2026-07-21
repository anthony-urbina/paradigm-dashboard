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
          background: "#111214",
          position: "relative",
        }}
      >
        {/* Subtle radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(241,80,37,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
          }}
        />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Paradigm Financial"
          style={{ width: 380, height: "auto", objectFit: "contain" }}
        />

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#949BA4",
              fontFamily: "sans-serif",
            }}
          >
            Agent Dashboard
          </span>
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
