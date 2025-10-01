// import { frontend } from './frontend';
// import { framework } from './framework';
import { DefaultTheme } from 'vitepress';
import generateSidebar from './generateSidebar';

export const sidebar: DefaultTheme.Sidebar = generateSidebar();

function getFirstLink(sidebar: DefaultTheme.SidebarMulti, path: string): string {
  const items = sidebar[path] as DefaultTheme.SidebarItem[];
  if (items?.length) {
    return items?.[0]?.items?.[0]?.items?.[0]?.link || '';
  }
  return '';
}


export const nav: DefaultTheme.NavItem[] = [
  { text: '世界', link: '/' },
  { text: '前端', link: getFirstLink(sidebar, '/frontend/') },
  { text: '框架', link: getFirstLink(sidebar, '/framework/') },
  { text: '后端', link: getFirstLink(sidebar, '/backend/') },
  // { text: '算法', link: '/algorithm/' },
];


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


