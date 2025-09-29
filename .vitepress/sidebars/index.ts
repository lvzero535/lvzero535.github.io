// import { frontend } from './frontend';
// import { framework } from './framework';
import { DefaultTheme } from 'vitepress';
import generateSidebar from './generateSidebar';

export const nav: DefaultTheme.NavItem[] = [
  { text: '世界', link: '/' },
  { text: '前端', link: '/frontend/browser/WEB安全' },
  { text: '框架', link: '/framework/Angular/Angular-2-自定义指令' },
  { text: '后端', link: '/backend/Docker/Docker基础' },
  // { text: '算法', link: '/algorithm/' },
  // { text: 'Examples', link: '/markdown-examples' }
];

export const sidebar: DefaultTheme.Sidebar = generateSidebar();

// export const sidebar: DefaultTheme.Sidebar = {
//   '/frontend/': frontend,
//   '/framework/': framework,
//   '/backend/': [{
//     text: '后端',
//     items: [
//       { text: 'nest', link: '/backend/' },
//     ]
//   }],
//   '/algorithm/': [{
//     text: '算法',
//     items: [
//       { text: '队列', link: '/algorithm/' },
//     ]
//   }],
//   '/markdown-examples': [{
//     text: 'Examples',
//     items: [
//       { text: 'Markdown Examples', link: '/markdown-examples' },
//       { text: 'Runtime API Examples', link: '/api-examples' }
//     ]
//   }]
// }


