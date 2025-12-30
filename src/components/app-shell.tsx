"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  CircleDot,
  LayoutGrid,
  PenSquare,
  Radar,
  Search,
  Send,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "概览", icon: LayoutGrid },
  { href: "/analysis", label: "选题分析", icon: Radar },
  { href: "/create", label: "内容创作", icon: PenSquare },
  { href: "/publish", label: "发布管理", icon: Send },
  { href: "/settings", label: "设置", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,246,230,0.9)_0%,_rgba(248,242,232,0.85)_40%,_rgba(255,255,255,0.95)_100%)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-border/60 bg-white/60 px-5 py-6 backdrop-blur lg:flex">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                内容工厂
              </p>
              <h1 className="text-lg font-semibold">Agent Studio</h1>
            </div>
            <Badge variant="secondary" className="rounded-full">
              原型
            </Badge>
          </div>
          <Separator className="my-5" />
          <NavLinks />
          <Separator className="my-5" />
          <div className="rounded-2xl border border-dashed border-border/70 bg-white/50 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CircleDot className="h-3 w-3 text-emerald-500" />
              系统在线
            </div>
            <p className="mt-2 leading-relaxed">
              早上 08:00 定时发布，公众号发布成功后自动回写链接。
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-white/70 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                  >
                    菜单
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      内容工厂
                    </p>
                    <h2 className="text-lg font-semibold">Agent Studio</h2>
                  </div>
                  <NavLinks onNavigate={() => undefined} />
                </SheetContent>
              </Sheet>

              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索选题、文章或任务"
                  className="h-7 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                />
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200/80 bg-amber-50 text-amber-900"
                >
                  默认定时 08:00
                </Badge>
                <Button className="rounded-full">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  新建发布任务
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-16 pt-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
