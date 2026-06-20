import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import os from 'os';

/** WSL + /mnt/c (OneDrive/NTFS) breaks Vite's atomic rename in node_modules/.vite */
function viteCacheDir(): string {
  const onWslWindowsMount =
    process.platform === 'linux' &&
    (process.env.WSL_DISTRO_NAME || __dirname.startsWith('/mnt/'));
  if (onWslWindowsMount) {
    return path.join(os.tmpdir(), 'collabdocs-vite-cache');
  }
  return path.resolve(__dirname, 'node_modules/.vite');
}

export default defineConfig({
  cacheDir: viteCacheDir(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
