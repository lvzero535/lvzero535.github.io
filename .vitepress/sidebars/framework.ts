import { DefaultTheme } from 'vitepress'
export const framework: DefaultTheme.SidebarItem[] = [
  {
  text: '框架',
  items: [
    { 
      text: 'Webpack',
      // collapsed: false,
      items: [
        // { text: '浏览器', link: '/frontend/browser/' },
        { text: 'Webpack不同环境构建Hash不变', link: '/framework/webpack/Webpack不同环境构建Hash不变' },
        { text: 'require-context用法', link: '/framework/webpack/require-context用法' },
      ]
    },
    { 
      text: 'Vue',
      items: [
        { text: 'Vue-router路由', link: '/framework/vue/Vue-router路由' },
      ]
    },
  ]
}]