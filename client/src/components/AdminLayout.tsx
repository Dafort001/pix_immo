import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  FileText,
  Images,
  Receipt,
  Users,
  CheckSquare,
  Key,
  Camera,
  ImagePlus,
  Upload,
  Sparkles,
  Download,
  Folder,
  ListOrdered,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminLayoutProps = {
  children: React.ReactNode;
  userRole: "admin" | "client" | "editor";
};

type NavigationItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  testId: string;
  adminOnly?: boolean;
  clientOnly?: boolean;
};

export function AdminLayout({ children, userRole }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Abgemeldet",
        description: "Bis bald!",
      });
      setLocation("/");
    },
  });

  // Main navigation items
  const mainNavigation: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      testId: "nav-dashboard",
    },
    {
      title: "Workflow Jobs",
      url: "/jobs",
      icon: Briefcase,
      testId: "nav-jobs",
    },
    {
      title: "pixcapture Jobs",
      url: "/admin/jobs",
      icon: Camera,
      testId: "nav-pixcapture-jobs",
      adminOnly: true,
    },
    {
      title: "pix.immo Aufträge",
      url: "/admin/pix-jobs",
      icon: Briefcase,
      testId: "nav-pix-jobs",
      adminOnly: true,
    },
    {
      title: "Buchungen",
      url: "/admin/bookings",
      icon: CalendarCheck,
      testId: "nav-bookings",
      adminOnly: true,
    },
  ];

  // Content management
  const contentManagement: NavigationItem[] = [
    {
      title: "Blog-Verwaltung",
      url: "/admin/blog",
      icon: FileText,
      testId: "nav-blog",
      adminOnly: true,
    },
    {
      title: "Media Library",
      url: "/admin/media-library",
      icon: Images,
      testId: "nav-media",
      adminOnly: true,
    },
    {
      title: "Redaktionsplan",
      url: "/admin/editorial",
      icon: FileText,
      testId: "nav-editorial",
      adminOnly: true,
    },
  ];

  // Photo workflow
  const photoWorkflow: NavigationItem[] = [
    {
      title: "Photo Upload",
      url: "/portal/gallery-photographer",
      icon: Camera,
      testId: "nav-photo-upload",
      adminOnly: true,
    },
    {
      title: "Final Editing",
      url: "/portal/gallery-editing",
      icon: ImagePlus,
      testId: "nav-final-editing",
      adminOnly: true,
    },
    {
      title: "RAW Upload",
      url: "/upload-raw",
      icon: Upload,
      testId: "nav-raw-upload",
      adminOnly: true,
    },
    {
      title: "AI Lab",
      url: "/ai-lab",
      icon: Sparkles,
      testId: "nav-ai-lab",
      adminOnly: true,
    },
    {
      title: "Bilder hochladen",
      url: "/portal/gallery-upload",
      icon: Folder,
      testId: "nav-gallery-upload",
      clientOnly: true,
    },
    {
      title: "Downloads",
      url: "/downloads",
      icon: Download,
      testId: "nav-downloads",
    },
  ];

  // Services
  const services: NavigationItem[] = [
    {
      title: "Preisliste",
      url: "/preisliste",
      icon: ListOrdered,
      testId: "nav-preisliste",
    },
    {
      title: "Buchen",
      url: "/buchen",
      icon: CalendarCheck,
      testId: "nav-buchen",
    },
    {
      title: "Galerie",
      url: "/galerie",
      icon: ImageIcon,
      testId: "nav-galerie",
    },
    {
      title: "Portfolio",
      url: "/gallery",
      icon: ImageIcon,
      testId: "nav-portfolio",
    },
  ];

  // Admin tools
  const adminTools: NavigationItem[] = [
    {
      title: "Rechnungen",
      url: "/admin/invoices",
      icon: Receipt,
      testId: "nav-invoices",
      adminOnly: true,
    },
    {
      title: "Editor Management",
      url: "/admin/editor-management",
      icon: Users,
      testId: "nav-editors",
      adminOnly: true,
    },
    {
      title: "Quality Check",
      url: "/qc-quality-check",
      icon: CheckSquare,
      testId: "nav-qc",
      adminOnly: true,
    },
    {
      title: "Passwort ändern",
      url: "/admin/password",
      icon: Key,
      testId: "nav-password",
      adminOnly: true,
    },
  ];

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const filterByRole = (items: NavigationItem[]) => {
    return items.filter((item) => {
      if (item.adminOnly && userRole !== "admin") return false;
      if (item.clientOnly && userRole !== "client") return false;
      return true;
    });
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <Link href="/">
              <div className="text-base font-semibold tracking-wide cursor-pointer">
                PIX.IMMO
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterByRole(mainNavigation).map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url + "/")}
                      >
                        <Link href={item.url}>
                          <span className="flex items-center gap-2" data-testid={item.testId}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Content Management - Admin Only */}
            {userRole === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel>Content</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterByRole(contentManagement).map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={location === item.url}
                        >
                          <Link href={item.url}>
                            <span className="flex items-center gap-2" data-testid={item.testId}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Photo Workflow */}
            <SidebarGroup>
              <SidebarGroupLabel>Foto-Workflow</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterByRole(photoWorkflow).map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url + "/")}
                      >
                        <Link href={item.url}>
                          <span className="flex items-center gap-2" data-testid={item.testId}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Services */}
            <SidebarGroup>
              <SidebarGroupLabel>Services</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterByRole(services).map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url + "/")}
                      >
                        <Link href={item.url}>
                          <span className="flex items-center gap-2" data-testid={item.testId}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Admin Tools - Admin Only */}
            {userRole === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin-Tools</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterByRole(adminTools).map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={location === item.url}
                        >
                          <Link href={item.url}>
                            <span className="flex items-center gap-2" data-testid={item.testId}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout-sidebar"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
