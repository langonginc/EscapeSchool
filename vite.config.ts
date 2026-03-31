import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键：设置为你的仓库名称，前后都要有斜杠
  base: '/EscapeSchool/', 
  resolve: {
    dedupe: ['excalibur']
  },
  build: {
    minify: false,         // 彻底关闭代码压缩和混淆
    target: 'esnext',      // 使用现代浏览器的原生 ES 模块支持
    sourcemap: true        // 顺便开启 sourcemap，如果以后再报错，能看到原始代码而不是乱码
  }
})