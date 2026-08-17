import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL ?? 'http://localhost:3000/api'),
    },
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
