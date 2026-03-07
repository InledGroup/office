import React from "react";
import { promises as fs } from "fs";
import path from "path";

interface OgImageProps {
  title?: string;
  subtitle?: string;
  brandName?: string;
}

const ORANGE = "#FF5900";
const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");
const CARD_STYLE = {
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
} as const;

let logoDataUri = "";
let logoLoaded = false;

async function getLogoDataUri() {
  // Cache the encoded logo to avoid reading from disk for every request.
  if (logoLoaded) {
    return logoDataUri;
  }

  logoLoaded = true;
  try {
    const logoData = await fs.readFile(LOGO_PATH);
    logoDataUri = `data:image/png;base64,${logoData.toString("base64")}`;
  } catch (error) {
    // Render with a fallback icon if logo.png is unavailable.
    console.error("Failed to read logo.png:", error);
  }

  return logoDataUri;
}

function splitBrandName(brandName: string) {
  const parts = brandName.trim().split(/\s+/).filter(Boolean);
  return {
    primary: parts[0] ?? "",
    secondary: parts.slice(1).join(" "),
  };
}

export const OgImage = async ({
  title = "Open & Edit Office Documents",
  subtitle = "No upload | No server | Fully private",
}: OgImageProps) => {
  const logoBase64 = await getLogoDataUri();

  return (
    <div
      tw="flex w-full h-full relative"
      style={{
        background: "#080808",
        fontFamily: "Inter, Smiley Sans, sans-serif",
        display: "flex",
      }}
    >
      <div
        tw="absolute top-[-20%] right-[-10%] w-[70%] h-[90%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 89, 0, 0.18) 0%, rgba(255, 89, 0, 0) 70%)",
        }}
      />
      <div
        tw="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      />

      <div
        tw="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div tw="absolute top-20 left-24 flex items-center z-10">
        {logoBase64 ? (
          <img
            src={logoBase64}
            width="64"
            height="64"
            style={{ borderRadius: "16px" }}
          />
        ) : (
          <div
            tw="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #FF8C40 100%)`,
              boxShadow: "0 8px 16px rgba(255, 89, 0, 0.25)",
            }}
          >
            <span tw="text-white text-4xl font-black">Z</span>
          </div>
        )}
        <div tw="flex flex-col ml-6">
          <span tw="text-[42px] font-black text-white leading-none tracking-tight">
            Office Suite
          </span>
        </div>
      </div>

      <div
        tw="absolute top-40 left-0 bottom-40 w-3 rounded-r-full"
        style={{ background: ORANGE, boxShadow: `0 0 30px ${ORANGE}` }}
      />

      <div tw="flex flex-1 flex-col justify-center p-24 z-10 mt-12">
        <div tw="flex flex-col">
          <div
            tw="text-[84px] font-black leading-none mb-2"
            style={{
              color: "white",
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
          <div
            tw="text-7xl font-black mb-10"
            style={{
              color: ORANGE,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            in Your Browser
          </div>
          <div tw="flex items-center">
            <div tw="w-12 h-1 bg-white/20 mr-6" />
            <div tw="text-3xl font-medium text-white/60">{subtitle}</div>
          </div>
        </div>
      </div>

      <div tw="flex flex-col justify-center pr-24 z-10">
        <div tw="flex flex-col items-center">
          <div
            tw="flex flex-col items-center justify-center w-40 h-40 rounded-3xl mb-[-50px] z-20"
            style={{
              ...CARD_STYLE,
              background: "linear-gradient(135deg, #2b579a 0%, #3b79d6 100%)",
              transform: "rotate(-6deg) translateX(-30px)",
            }}
          >
            <span tw="text-white text-7xl font-black">W</span>
          </div>

          <div
            tw="flex flex-col items-center justify-center w-40 h-40 rounded-3xl mb-[-50px] z-30"
            style={{
              ...CARD_STYLE,
              background: "linear-gradient(135deg, #217346 0%, #2ba362 100%)",
              transform: "rotate(2deg)",
            }}
          >
            <span tw="text-white text-7xl font-black">X</span>
          </div>

          <div
            tw="flex flex-col items-center justify-center w-40 h-40 rounded-3xl z-40"
            style={{
              ...CARD_STYLE,
              background: "linear-gradient(135deg, #c43e1c 0%, #f05228 100%)",
              transform: "rotate(10deg) translateX(30px)",
            }}
          >
            <span tw="text-white text-7xl font-black">P</span>
          </div>
        </div>
      </div>
    </div>
  );
};
