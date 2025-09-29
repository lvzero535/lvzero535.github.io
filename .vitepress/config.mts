import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LV Notes",
  description: "LV Notes",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '前端', link: '/frontend/browser/' },
      { text: '后端', link: '/backend/' },
      { text: '算法', link: '/algorithm/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/frontend/': [
        {
        text: '前端',
        items: [
          { 
            text: '浏览器',
            // collapsed: false,
            items: [
              { text: '浏览器', link: '/frontend/browser/' },
            ]
          },
          { 
            text: 'JavaScript',
            items: [
              { text: 'JS', link: '/frontend/js/' },
            ]
          },
          { 
            text: 'CSS',
            items: [
              { text: 'CSS', link: '/frontend/css/' },
            ]
          },
        ]
      }],
      '/backend/': [{
        text: '后端',
        items: [
          { text: 'nest', link: '/backend/' },
        ]
      }],
      '/algorithm/': [{
        text: '算法',
        items: [
          { text: '队列', link: '/algorithm/' },
        ]
      }],
      '/markdown-examples': [{
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
