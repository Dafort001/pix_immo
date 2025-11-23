import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

type MenuItem = {
  label: string;
  href: string;
  testId: string;
};

type GlobalLayoutProps = {
  children: React.ReactNode;
};

// Public menu items (when not authenticated)
const publicMenuItems: MenuItem[] = [
  { label: "Home", href: "/", testId: "menu-link-home" },
  { label: "Preise", href: "/preise", testId: "menu-link-preise" },
  { label: "Galerie", href: "/gallery", testId: "menu-link-gallery" },
  { label: "Blog", href: "/blog", testId: "menu-link-blog" },
  { label: "Kontakt", href: "/kontakt-formular", testId: "menu-link-kontakt" },
  { label: "Login", href: "/login", testId: "menu-link-login" },
];

// Customer menu items (when authenticated)
const customerMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", testId: "menu-link-dashboard" },
  { label: "Jobs", href: "/jobs", testId: "menu-link-jobs" },
  { label: "Galerie", href: "/gallery", testId: "menu-link-gallery" },
  { label: "Preise", href: "/preise", testId: "menu-link-preise" },
  { label: "Blog", href: "/blog", testId: "menu-link-blog" },
  { label: "Kontakt", href: "/kontakt-formular", testId: "menu-link-kontakt" },
];

// Routes that should not show the global layout (they have their own layout)
const ROUTES_WITHOUT_GLOBAL_LAYOUT = [
  "/admin",
  "/editor-dashboard",
  "/editor-job-detail",
  "/capture",
  "/app",
  "/portal",
  "/orders",
  "/qc-quality-check",
];

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current route should use global layout
  const shouldShowLayout = !ROUTES_WITHOUT_GLOBAL_LAYOUT.some((route) =>
    location.startsWith(route)
  );

  // Fetch user authentication status
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const isAuthenticated = !!userData?.user;
  const menuItems = isAuthenticated ? customerMenuItems : publicMenuItems;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setIsMenuOpen(false);
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
      // Layout will automatically switch to public menu because isAuthenticated becomes false
    },
  });

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // If route doesn't need global layout, render children directly
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-[5vw] py-4">
          {/* Logo - links to homepage */}
          <Link href="/">
            <div
              className="text-base font-semibold tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
              data-testid="brand-logo"
            >
              PIX.IMMO
            </div>
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            aria-label="Menü öffnen"
            aria-expanded={isMenuOpen}
            data-testid="button-menu-open"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Hamburger Menu Drawer (right side) */}
      {isMenuOpen && (
        <aside
          className="fixed inset-0 z-50 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMenuOpen(false);
          }}
          data-testid="menu-overlay"
        >
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            data-testid="menu-drawer"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <Link href="/">
                <div
                  className="text-base font-semibold tracking-wide cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  PIX.IMMO
                </div>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="hover:opacity-70"
                aria-label="Menü schließen"
                data-testid="button-menu-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col px-6 py-8">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className="block px-4 py-3 text-base rounded-md hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                      data-testid={item.testId}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}

                {/* Logout button (only when authenticated) */}
                {isAuthenticated && (
                  <>
                    <div className="my-4 border-t" />
                    <button
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 text-base rounded-md hover-elevate active-elevate-2 text-left"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Abmelden</span>
                    </button>
                  </>
                )}
              </div>
            </nav>

            {/* User Info (when authenticated) */}
            {isAuthenticated && userData?.user && (
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600" data-testid="user-email">
                  {userData.user.email}
                </div>
                <div className="text-xs text-gray-500 capitalize" data-testid="user-role">
                  {userData.user.role}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
