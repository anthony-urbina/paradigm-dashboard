import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(path.join(process.cwd(), "public", "Paradigm Financial Logo-16.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0b0c",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange glow — left */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(241,80,37,0.22) 0%, transparent 60%)",
          top: "50%",
          left: -200,
          transform: "translateY(-50%)",
        }}
      />

      {/* Blurple glow — right */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(88,101,242,0.18) 0%, transparent 60%)",
          top: "50%",
          right: -200,
          transform: "translateY(-50%)",
        }}
      />

      {/* Thin horizontal rule top */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 64,
          right: 64,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
        }}
      />

      {/* Logo — centered, large */}
      <img
        src={logoSrc}
        alt='Paradigm Financial'
        width={440}
        height={383}
      />

      {/* Bottom row */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 64,
          right: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#F15025",
            }}
          />
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "sans-serif",
            }}
          >
            Agent Portal
          </span>
        </div>
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.18)",
            fontFamily: "sans-serif",
          }}
        >
          paradigmfinancial.io
        </span>
      </div>

      {/* Thin horizontal rule bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 64,
          right: 64,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)",
        }}
      />
    </div>,
    { ...size },
  );
}
