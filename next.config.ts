import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: "./",
    extract: {
      sourceLocale: "en",
    },
    messages: {
      path: "./messages",
      format: "json",
      locales: ["en", "es", "zh-CN", "zh-TW", "ja", "ko"],
    },
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;",
          },
        ],
      },
      {
        source: "/x2t/x2t.wasm",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
        ],
      },
      {
        source: "/x2t-:suffix/:path*",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31556952, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
