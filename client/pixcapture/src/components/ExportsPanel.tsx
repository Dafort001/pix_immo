import { Download, FileArchive, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { useDownloads } from "../hooks/useOrderStatus";

interface ExportsPanelProps {
  orderId: string;
}

interface ExportPackage {
  id: string;
  packageType: "originals" | "edited" | "final" | "custom";
  filename: string;
  sizeBytes: number;
  createdAt: string;
  expiresAt?: string;
  downloadUrl: string;
  downloaded: boolean;
}

export function ExportsPanel({ orderId }: ExportsPanelProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { data, isLoading, error } = useDownloads(orderId);

  const packages: ExportPackage[] = data?.packages || [];

  const handleDownload = async (pkg: ExportPackage) => {
    try {
      // Open download URL in new tab
      window.open(pkg.downloadUrl, "_blank");

      toast({
        title: t("toast.download_started"),
        description: pkg.filename,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error.network"),
        description:
          error instanceof Error ? error.message : t("error.network"),
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPackageTypeLabel = (type: ExportPackage["packageType"]): string => {
    return t(`export.type.${type}`);
  };

  const getPackageTypeVariant = (
    type: ExportPackage["packageType"]
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case "final":
        return "default";
      case "edited":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="card-exports">
        <CardHeader>
          <CardTitle>{t("export.title")}</CardTitle>
          <CardDescription>{t("export.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {t("common.loading")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="card-exports">
        <CardHeader>
          <CardTitle>{t("export.title")}</CardTitle>
          <CardDescription>{t("export.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-3 text-destructive opacity-50" />
            <p className="text-destructive font-medium mb-2">
              {t("error.network")}
            </p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : t("error.network")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-exports">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("export.title")}</CardTitle>
            <CardDescription>{t("export.subtitle")}</CardDescription>
          </div>
          <Badge variant={packages.length > 0 ? "default" : "secondary"}>
            {packages.length} {packages.length === 1 ? t("export.package") : t("export.packages")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {packages.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t("empty.no_exports")}</p>
          </div>
        )}

        {packages.map((pkg) => {
          const isExpired = pkg.expiresAt
            ? new Date(pkg.expiresAt) < new Date()
            : false;

          return (
            <div
              key={pkg.id}
              className="flex items-center gap-4 p-4 rounded border hover-elevate"
              data-testid={`export-package-${pkg.id}`}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                  <FileArchive className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{pkg.filename}</p>
                  <Badge
                    variant={getPackageTypeVariant(pkg.packageType)}
                    data-testid={`badge-type-${pkg.id}`}
                  >
                    {getPackageTypeLabel(pkg.packageType)}
                  </Badge>
                  {pkg.downloaded && (
                    <Badge variant="outline" data-testid={`badge-downloaded-${pkg.id}`}>
                      {t("export.downloaded")}
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge
                      variant="destructive"
                      data-testid={`badge-expired-${pkg.id}`}
                    >
                      {t("export.expired")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatFileSize(pkg.sizeBytes)}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(pkg.createdAt)}
                  </span>
                  {pkg.expiresAt && !isExpired && (
                    <span className="text-destructive">
                      {t("export.expires")}: {formatDate(pkg.expiresAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(pkg)}
                  disabled={isExpired}
                  data-testid={`button-download-${pkg.id}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("button.download")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
