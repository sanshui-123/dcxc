import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {badge ? (
          <Badge variant="secondary" className="mb-3 rounded-full">
            {badge}
          </Badge>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
