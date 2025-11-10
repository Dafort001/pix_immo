import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ListOrdered } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { SidebarTrigger } from "@/components/ui/sidebar";

type User = {
  id: string;
  email: string;
  role: "client" | "admin";
  createdAt: number;
};

type Order = {
  id: string;
  userId: string;
  propertyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  propertyAddress: string;
  preferredDate: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: number;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn<{ orders: Order[] }>({ on401: "returnNull" }),
    enabled: !!userData,
  });

  if (!userData && !userLoading) {
    setLocation("/login");
    return null;
  }

  if (userLoading || !userData) {
    return (
      <AdminLayout userRole="client">
        <div className="container mx-auto px-6 py-12">
          <Skeleton className="mb-8 h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const user = userData.user;
  const orders = ordersData?.orders || [];

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "confirmed":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "ausstehend";
      case "confirmed":
        return "bestätigt";
      case "completed":
        return "abgeschlossen";
      case "cancelled":
        return "storniert";
      default:
        return status;
    }
  };

  return (
    <AdminLayout userRole={user.role}>
      <div className="flex flex-col h-full">
        <header className="border-b bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-12">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="mb-2 text-lg font-bold" data-testid="text-welcome">
                  Willkommen zurück, {user.email}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Ihr Dashboard</p>
                  <Badge variant="outline" data-testid="badge-role">
                    {user.role === "admin" ? "Admin" : "Kunde"}
                  </Badge>
                </div>
              </div>
              <Link href="/order">
                <Button size="lg" data-testid="button-new-order">
                  <Plus className="mr-2 h-5 w-5" />
                  Neuer Auftrag
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <ListOrdered className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {user.role === "admin" ? "Alle Aufträge" : "Ihre Aufträge"}
                </h3>
              </div>

              {ordersLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <ListOrdered className="mb-4 h-16 w-16 text-muted-foreground" />
                    <h4 className="mb-2 text-base font-semibold">Noch keine Aufträge</h4>
                    <p className="mb-6 text-center text-muted-foreground">
                      Erstellen Sie Ihren ersten Auftrag für Immobilienfotografie
                    </p>
                    <Link href="/order">
                      <Button data-testid="button-create-first-order">
                        <Plus className="mr-2 h-4 w-4" />
                        Ersten Auftrag erstellen
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orders.map((order) => (
                    <Card key={order.id} data-testid={`card-order-${order.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="truncate">{order.propertyName}</CardTitle>
                            <CardDescription className="truncate">
                              {order.propertyAddress}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            data-testid={`badge-status-${order.id}`}
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Kontakt: </span>
                            <span>{order.contactName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Telefon: </span>
                            <span>{order.contactPhone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Datum: </span>
                            <span>{order.preferredDate}</span>
                          </div>
                          {order.notes && (
                            <div className="pt-2 border-t">
                              <span className="text-muted-foreground">Notizen: </span>
                              <p className="mt-1 text-xs line-clamp-2">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
