import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 这个用于启动
    port: '8092', // 指定启动端口
    open: true //启动后是否自动打开浏览器
  }
})



