import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export default function Layout({ children, title, action }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border/40 bg-background px-6">
          <div className="flex flex-1 items-center gap-4">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <i className="fa-solid fa-magnifying-glass h-4 w-4"></i>
            </button>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <i className="fa-regular fa-bell h-4 w-4"></i>
            </button>
            {action}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
