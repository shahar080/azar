import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('D:\\dev\\cert\\key.pem'),
      cert: fs.readFileSync('D:\\dev\\cert\\cert.pem'),
    },
    host: 'localhost',  // Optional, but you can specify a host here
    port: 5173,         // Port to use (make sure it's open and not blocked by firewalls)
  },
})
