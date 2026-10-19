import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SehatYar",
    short_name: "SehatYar",
    description:
      "Pashto-first medicine lookup and health FAQs for communities in Afghanistan.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4faf7",
    theme_color: "#0f766e",
    lang: "ps",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
