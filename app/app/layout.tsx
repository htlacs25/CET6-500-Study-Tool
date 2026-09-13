import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CET-4 550 每日英语训练台',
  description: '面向四级 550 分目标的本地每日听说读写学习工具。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
