import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src', // Adjust the alias based on your project structure
    },
  },
  plugins: [react()],
});
