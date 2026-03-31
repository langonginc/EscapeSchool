import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键：设置为你的仓库名称，前后都要有斜杠
  base: '/EscapeSchool/', 
  resolve: {
    dedupe: ['excalibur']
  }
})