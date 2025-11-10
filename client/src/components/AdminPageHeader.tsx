import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AdminPageHeaderProps = {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  showBackButton = false,
  backTo = "/dashboard",
  backLabel = "Zurück zum Dashboard",
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="border-b bg-background px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          {showBackButton && (
            <Link href={backTo}>
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
