import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "虫草管家 Pro - 冬虫夏草公众号管理系统",
  description: "基于 AI 的冬虫夏草公众号内容管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
