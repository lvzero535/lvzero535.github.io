import { DefaultTheme } from 'vitepress'
export const frontend: DefaultTheme.SidebarItem[] = [
  {
  text: '前端',
  items: [
    { 
      text: '浏览器',
      // collapsed: false,
      items: [
        // { text: '浏览器', link: '/frontend/browser/' },
        { text: '浏览器渲染原理', link: '/frontend/browser/浏览器渲染原理' },
        { text: 'XMLHttpRequest', link: '/frontend/browser/XMLHttpRequest' },
        { text: 'WEB安全', link: '/frontend/browser/WEB安全' },
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
}]