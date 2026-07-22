import withBundleAnalyzerInit from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "www.cultura.gal" },
      { protocol: "https", hostname: "cultura.gal" },
      { protocol: "https", hostname: "www.turismo.gal" },
      { protocol: "https", hostname: "turismo.gal" },
    ],
  },
};

// Bundle analysis: ANALYZE=true npm run build
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
