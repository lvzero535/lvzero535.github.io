import fs from 'fs';
import path from 'path';
import { DefaultTheme } from 'vitepress';

function generateSidebar(paths: Record<string, string>, root: string, dir: string) {
  const files = fs.readdirSync(path.resolve(root, dir));
  const sidebar: DefaultTheme.SidebarItem[] = [{
    text: paths[dir],
    items: []
  }];
  files.forEach(file => {

    if (file === 'images' || file.endsWith('.md')) {
      return;
    }

    const subFiles = fs.readdirSync(path.resolve(root, dir, file));

    const items = subFiles.filter(f => {
      return f !== 'images';
    }).map(f => {
      return {
        text: f.replace('.md', ''),
        link: `/${dir}/${file}/${f.replace('.md', '')}`
      };
    })
    sidebar[0].items?.push({
      text: file[0].toUpperCase() + file.slice(1),
      items: items
    });
    
  });
  return sidebar;
}

export default function() {
  const paths: Record<string, string> = {
    'frontend': '前端',
    'framework': '框架',
    'backend': '后端',
    'algorithm': '算法'
  }
  return Object.keys(paths).reduce((acc, dir) => {
    acc[`/${dir}/`] = generateSidebar(paths, process.cwd(), dir);
    return acc;
  }, {} as Record<string, DefaultTheme.SidebarItem[]>); 
};