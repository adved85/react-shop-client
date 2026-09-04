// vitest/config re-exports Vite's defineConfig and is what makes the `test`
// block below take effect.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  test: {
    // Tests live outside src/ and mirror its layout: tests/api/client.test.js
    // covers src/api/client.js, and so on.
    include: ['tests/**/*.test.{js,jsx}'],
    // client.js reaches for localStorage and window.location.
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
})
