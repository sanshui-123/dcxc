"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PenSquare, Search, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "概览", icon: LayoutGrid },
  { href: "/create", label: "内容创作", icon: PenSquare },
  { href: "/publish", label: "发布管理", icon: Send },
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
            <h1 className="text-lg font-semibold">珍峰冬虫夏草</h1>
          </div>
          <Separator className="my-5" />
          <NavLinks />
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
                    <h2 className="text-lg font-semibold">珍峰冬虫夏草</h2>
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
