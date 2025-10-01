import { defineConfig } from 'vitepress';
import { nav, sidebar } from './sidebars/index';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh',
  title: "世界，你好！",
  description: "这是我留下的痕迹。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav,

    sidebar,

    search: {
      provider: 'local'
    },

    outline: [2, 3],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lvzero535/lvzero535.github.io' }
    ],

    outlineTitle: '本页目录',
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
  }
})
