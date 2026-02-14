// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routes: {
      extend: {
        exclude: [{ pattern: "/api/auth" }, { pattern: "/api/callback" }]
      }
    }
  }),
});
