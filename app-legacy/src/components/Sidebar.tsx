"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "fa-layout-dashboard", label: "仪表盘" },
  { href: "/analysis", icon: "fa-wand-magic-sparkles", label: "AI 选题" },
  { href: "/create", icon: "fa-file-pen", label: "内容创作" },
  { href: "/publish", icon: "fa-list", label: "发布管理" },
  { href: "/settings", icon: "fa-settings", label: "设置" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-border/40 bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border/40 px-6">
          <svg
            className="mr-2 h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="text-lg font-semibold">虫草管家</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <i className={`fa-solid ${item.icon} h-4 w-4`}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-border/40 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              李
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">李主编</p>
              <p className="truncate text-xs text-muted-foreground">admin@chongcao.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
