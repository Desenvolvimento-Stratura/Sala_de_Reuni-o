import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const certKeyPath = './cert-key.pem'
const certPath = './cert.pem'
const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certPath)

export default defineConfig({
  plugins: [react()],
  server: {
    https: hasCerts
      ? {
          key: fs.readFileSync(certKeyPath),
          cert: fs.readFileSync(certPath)
        }
      : false,
    fs: { strict: false }
  }
})