import { promises as fs } from "fs";
import path from "path";

type OgFonts = NonNullable<
  NonNullable<
    ConstructorParameters<typeof import("next/og").ImageResponse>[1]
  >["fonts"]
>;
type OgFont = OgFonts[number];
type OgFontWeight = Exclude<OgFont["weight"], undefined>;

const ASSETS_DIR = path.join(process.cwd(), "assets");
const FONT_SOURCES: Array<{
  file: string;
  name: string;
  style: "normal" | "italic";
  weight: OgFontWeight;
}> = [
  {
    file: "Inter_24pt-Regular.ttf",
    name: "Inter",
    style: "normal",
    weight: 400,
  },
  {
    file: "Inter_24pt-Medium.ttf",
    name: "Inter",
    style: "normal",
    weight: 500,
  },
  {
    file: "Inter_24pt-Bold.ttf",
    name: "Inter",
    style: "normal",
    weight: 700,
  },
  {
    file: "Inter_24pt-Black.ttf",
    name: "Inter",
    style: "normal",
    weight: 900,
  },
  {
    file: "SmileySans-Oblique.ttf",
    name: "Smiley Sans",
    style: "normal",
    weight: 400,
  },
];

let cachedFonts: OgFonts | null = null;

async function loadFontFile(
  file: string,
  name: string,
  style: "normal" | "italic",
  weight: OgFontWeight,
): Promise<OgFont | null> {
  try {
    const data = await fs.readFile(path.join(ASSETS_DIR, file));
    return { name, data, style, weight };
  } catch {
    return null;
  }
}

export async function getOgFonts(): Promise<OgFonts> {
  if (cachedFonts) {
    return cachedFonts;
  }

  const loadedFonts = await Promise.all(
    FONT_SOURCES.map(({ file, name, style, weight }) =>
      loadFontFile(file, name, style, weight),
    ),
  );
  const fonts = loadedFonts.filter((font): font is OgFont => Boolean(font));

  if (fonts.length === 0) {
    throw new Error("No OG fonts could be loaded from website/assets.");
  }

  cachedFonts = fonts;

  return fonts;
}
