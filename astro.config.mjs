// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { loadEnv } from "vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: "v868rpdv",
      dataset: "dev",
      useCdn: false, // See note on using the CDN
      apiVersion: "2026-02-21", // insert the current date to access the latest version of the API
      studioBasePath: "/admin", // If you want to access the Studio on a route
      stega: {
        studioUrl: "/admin",
      },
    }),
    react(),
  ],

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
