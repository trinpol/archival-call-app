import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject API_KEY from environment to browser process.env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure the build fails if the API key isn't provided (optional, but safer)
    minify: 'terser',
  },
  server: {
    port: 3000
  }
});