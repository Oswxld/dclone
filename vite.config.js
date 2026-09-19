import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],

  server: {
    allowedHosts: [
      'bryn-coy-noncontrollablely.ngrok-free.dev',
    ],
  },
})