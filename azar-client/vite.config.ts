import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https: {
    //   key: fs.readFileSync(`D:\\dev\\cert\\key.pem`),
    //   cert: fs.readFileSync(`D:\\dev\\cert\\cert.pem`),
    // },
    port: 5173,
  },
})
