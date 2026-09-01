import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CET-6 500 每日英语训练台',
  description: '从基础重建到六级 500 分的本地每日学习工具。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
