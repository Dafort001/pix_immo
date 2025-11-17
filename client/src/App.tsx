import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { FEATURE_QA_GUARD } from "@/config/flags";
import { RollbackBanner } from "@/components/RollbackBanner";
import { useSmokeChecks } from "@/hooks/useSmokeChecks";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Gallery from "@/pages/gallery";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import OrderForm from "@/pages/order-form";
import Imprint from "@/pages/imprint";
import AGB from "@/pages/agb";
import Contact from "@/pages/contact";
import Pricing from "@/pages/pricing";
import Intake from "@/pages/intake";
import Jobs from "@/pages/jobs";
import Review from "@/pages/review";
import Preisliste from "@/pages/preisliste";
import Booking from "@/pages/booking";
import BookingConfirmation from "@/pages/booking-confirmation";
import Galerie from "@/pages/galerie";
import Datenschutz from "@/pages/datenschutz";
import KontaktFormular from "@/pages/kontakt-formular";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Downloads from "@/pages/downloads";
import AdminEditorial from "@/pages/admin-editorial";
import AdminSeo from "@/pages/admin-seo";
import UploadRaw from "@/pages/upload-raw";
import AILab from "@/pages/ai-lab";
import DemoUpload from "@/pages/demo-upload";
import DemoJobs from "@/pages/demo-jobs";
import DemoJobDetail from "@/pages/demo-job-detail";
import DocsRoomsSpec from "@/pages/docs-rooms-spec";
import GalleryClassify from "@/pages/gallery-classify";
import CaptureIndex from "@/pages/capture/index";
import CaptureCamera from "@/pages/capture/camera";
import CaptureReview from "@/pages/capture/review";
import CaptureUpload from "@/pages/capture/upload";
import AppSplash from "@/pages/app/splash";
import AppCamera from "@/pages/app/camera";
import AppGallery from "@/pages/app/gallery";
import AppUpload from "@/pages/app/upload";
import AppSettings from "@/pages/app/settings";
import UploadsOverview from "@/pages/portal/uploads-overview";
import GallerySelection from "@/pages/portal/gallery-selection";
import Payment from "@/pages/portal/payment";
import StatusTimeline from "@/pages/portal/status-timeline";
import Delivery from "@/pages/portal/delivery";
import CustomerUploadGallery from "@/pages/portal/gallery-upload";
import PhotographerUploadGallery from "@/pages/portal/gallery-photographer";
import EditingGallery from "@/pages/portal/gallery-editing";
import OrderStacksPage from "@/pages/orders/stacks";
import OrderReviewPage from "@/pages/orders/review";
import OrderExportsPage from "@/pages/orders/exports";
import NotFound from "@/pages/not-found";
import TestDebug from "@/pages/test-debug";
import ExportOverview from "@/pages/export-overview";
import EditorDashboard from "@/pages/editor-dashboard";
import EditorJobDetail from "@/pages/editor-job-detail";
import AdminPassword from "@/pages/admin-password";
import AdminEditorManagement from "@/pages/admin-editor-management";
import QCQualityCheck from "@/pages/qc-quality-check";
import AdminMediaLibrary from "@/pages/admin-media-library";
import AdminInvoices from "@/pages/admin-invoices";
import AdminBlog from "@/pages/admin-blog";
import AdminServices from "@/pages/admin-services";
import AdminBookings from "@/pages/admin-bookings";
import AdminJobs from "@/pages/admin-jobs";
import AdminPixJobs from "@/pages/admin-pix-jobs";
import AdminInternalBooking from "@/pages/admin-internal-booking";
import QAPage from "@/routes/qa";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/export-overview" component={ExportOverview} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/password" component={AdminPassword} />
      <Route path="/admin/editor-management" component={AdminEditorManagement} />
      <Route path="/admin/media-library" component={AdminMediaLibrary} />
      <Route path="/admin/invoices" component={AdminInvoices} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/internal-booking" component={AdminInternalBooking} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/pix-jobs" component={AdminPixJobs} />
      <Route path="/qc-quality-check" component={QCQualityCheck} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/order" component={OrderForm} />
      <Route path="/impressum" component={Imprint} />
      <Route path="/agb" component={AGB} />
      <Route path="/kontakt" component={Contact} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/kontakt-formular" component={KontaktFormular} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={FAQ} />
      <Route path="/preise" component={Pricing} />
      <Route path="/preisliste" component={Preisliste} />
      <Route path="/buchen" component={Booking} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/galerie" component={Galerie} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/intake" component={Intake} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/review/:jobId/:shootId" component={Review} />
      <Route path="/admin/editorial" component={AdminEditorial} />
      <Route path="/admin/seo" component={AdminSeo} />
      <Route path="/upload-raw" component={UploadRaw} />
      <Route path="/ai-lab" component={AILab} />
      <Route path="/demo-upload" component={DemoUpload} />
      <Route path="/demo-jobs" component={DemoJobs} />
      <Route path="/job/:id" component={DemoJobDetail} />
      <Route path="/docs/rooms-spec" component={DocsRoomsSpec} />
      <Route path="/gallery/classify/:shootId" component={GalleryClassify} />
      <Route path="/capture" component={CaptureIndex} />
      <Route path="/capture/camera" component={CaptureCamera} />
      <Route path="/capture/review" component={CaptureReview} />
      <Route path="/capture/upload" component={CaptureUpload} />
      <Route path="/app" component={AppSplash} />
      <Route path="/app/camera" component={AppCamera} />
      <Route path="/app/gallery" component={AppGallery} />
      <Route path="/app/upload" component={AppUpload} />
      <Route path="/app/settings" component={AppSettings} />
      <Route path="/portal/uploads" component={UploadsOverview} />
      <Route path="/portal/job/:jobId" component={GallerySelection} />
      <Route path="/portal/galerie-auswahl" component={GallerySelection} />
      <Route path="/portal/payment/:jobId" component={Payment} />
      <Route path="/portal/status/:jobId" component={StatusTimeline} />
      <Route path="/portal/delivery/:jobId" component={Delivery} />
      <Route path="/portal/gallery-upload" component={CustomerUploadGallery} />
      <Route path="/portal/gallery-photographer" component={PhotographerUploadGallery} />
      <Route path="/portal/gallery-editing" component={EditingGallery} />
      <Route path="/orders/:orderId/stacks" component={OrderStacksPage} />
      <Route path="/orders/:orderId/review" component={OrderReviewPage} />
      <Route path="/orders/:orderId/exports" component={OrderExportsPage} />
      <Route path="/editor-dashboard" component={EditorDashboard} />
      <Route path="/editor-job-detail" component={EditorJobDetail} />
      <Route path="/test" component={TestDebug} />
      {FEATURE_QA_GUARD && <Route path="/qa" component={QAPage} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Note: Device capability detection moved to Camera View
  // to ensure camera permission is already granted
  
  const { hasFailures } = useSmokeChecks();
  
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          {FEATURE_QA_GUARD && <RollbackBanner visible={hasFailures} />}
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
