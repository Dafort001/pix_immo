import { Route, Switch } from "wouter";
import { Toaster } from "./components/ui/sonner";
import "./styles/globals.css";

// Public pages
import Home from "./pages/home";
import About from "./pages/about";
import Pricing from "./pages/preise";
import Booking from "./pages/booking";
import Login from "./pages/login";
import Register from "./pages/register";

// Lazy load other pages (we'll create them next)
import { lazy, Suspense } from "react";

const Gallery = lazy(() => import("./pages/gallery"));
const PortfolioDetail = lazy(() => import("./pages/portfolio-detail"));
const Blog = lazy(() => import("./pages/blog"));
const BlogPost = lazy(() => import("./pages/blog-post"));
const Contact = lazy(() => import("./pages/contact"));
const KontaktFormular = lazy(() => import("./pages/kontakt-formular"));
const FAQ = lazy(() => import("./pages/faq"));
const BookingConfirmation = lazy(() => import("./pages/booking-confirmation"));
const Impressum = lazy(() => import("./pages/impressum"));
const Datenschutz = lazy(() => import("./pages/datenschutz"));
const AGB = lazy(() => import("./pages/agb"));
const NotFound = lazy(() => import("./pages/not-found"));
const LoginOTPRequest = lazy(() => import("./pages/login-otp-request"));
const LoginOTPVerify = lazy(() => import("./pages/login-otp-verify"));
const RegisterVerify = lazy(() => import("./pages/register-verify"));

// Workflow/Portal pages
const Dashboard = lazy(() => import("./pages/dashboard"));
const Jobs = lazy(() => import("./pages/jobs"));
const Intake = lazy(() => import("./pages/intake"));
const Review = lazy(() => import("./pages/review"));
const OrderForm = lazy(() => import("./pages/order-form"));
const Preisliste = lazy(() => import("./pages/preisliste"));
const Galerie = lazy(() => import("./pages/galerie"));
const DemoJobs = lazy(() => import("./pages/demo-jobs"));
const DemoJobDetail = lazy(() => import("./pages/demo-job-detail"));
const DemoUpload = lazy(() => import("./pages/demo-upload"));
const Downloads = lazy(() => import("./pages/downloads"));
const UploadEditingTeam = lazy(() => import("./pages/upload-editing-team"));
const EingegangeneUploads = lazy(() => import("./pages/eingegangene-uploads"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));

// Admin pages
const AdminEditorial = lazy(() => import("./pages/admin-editorial"));
const AdminSEO = lazy(() => import("./pages/admin-seo"));
const AILab = lazy(() => import("./pages/ai-lab"));
const GalleryClassify = lazy(() => import("./pages/gallery-classify"));

// New Workflow pages
const QCDashboard = lazy(() => import("./pages/qc-dashboard"));
const QCQualityCheck = lazy(() => import("./pages/qc-quality-check"));
const EditorDashboard = lazy(() => import("./pages/editor-dashboard"));
const EditorJobDetail = lazy(() => import("./pages/editor-job-detail"));
const AdminEditorManagement = lazy(() => import("./pages/admin-editor-management"));
const EditorRevision = lazy(() => import("./pages/editor-revision"));
const DeliveryPrep = lazy(() => import("./pages/delivery-prep"));
const UploadStatus = lazy(() => import("./pages/upload-status"));
const MiniGallery = lazy(() => import("./pages/mini-gallery"));
const Settings = lazy(() => import("./pages/settings"));
const Invoices = lazy(() => import("./pages/invoices"));

// Docs
const DocsRoomsSpec = lazy(() => import("./pages/docs-rooms-spec"));
const DevNotesQC = lazy(() => import("./pages/dev-notes-qc"));

// Mobile App
const AppSplash = lazy(() => import("./pages/app-splash"));
const AppLogin = lazy(() => import("./pages/app-login"));
const AppJobs = lazy(() => import("./pages/app-jobs"));
const AppJobNew = lazy(() => import("./pages/app-job-new"));
const AppSettings = lazy(() => import("./pages/app-settings"));
const AppCamera = lazy(() => import("./pages/app-camera"));
const AppGallery = lazy(() => import("./pages/app-gallery"));
const AppUpload = lazy(() => import("./pages/app-upload"));
const AppNotifications = lazy(() => import("./pages/app-notifications"));
const AppIndex = lazy(() => import("./pages/app-index"));
const AppNav = lazy(() => import("./pages/app-nav"));
const AppCameraLandscapeDemo = lazy(() => import("./pages/app-camera-landscape-demo"));
const DemoPushNotifications = lazy(() => import("./pages/demo-push-notifications"));
const DevIndex = lazy(() => import("./pages/dev-index"));
const DevResetApp = lazy(() => import("./pages/dev-reset-app"));

// PixCapture.app (Self-Service Platform)
const PixCaptureHome = lazy(() => import("./pages/pixcapture-home"));
const PixCaptureAbout = lazy(() => import("./pages/pixcapture-about"));
const PixCaptureHelp = lazy(() => import("./pages/pixcapture-help"));
const PixCaptureExpertCall = lazy(() => import("./pages/pixcapture-expert-call"));
const PixCaptureImpressum = lazy(() => import("./pages/pixcapture-impressum"));
const PixCaptureDatenschutz = lazy(() => import("./pages/pixcapture-datenschutz"));
const PixCaptureAGB = lazy(() => import("./pages/pixcapture-agb"));

// PixCapture App - Start & Verification
const AppSplashFirstLaunch = lazy(() => import("./pages/app-splash-firstlaunch"));
const AppVerifyUser = lazy(() => import("./pages/app-verify-user"));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-muted-foreground">Lädt...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/preise" component={Pricing} />
          <Route path="/portfolio" component={Gallery} />
          <Route path="/portfolio/:id" component={PortfolioDetail} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/contact" component={Contact} />
          <Route path="/kontakt" component={Contact} />
          <Route path="/kontakt-formular" component={KontaktFormular} />
          <Route path="/faq" component={FAQ} />
          
          {/* Booking */}
          <Route path="/booking" component={Booking} />
          <Route path="/booking-confirmation" component={BookingConfirmation} />
          
          {/* Legal */}
          <Route path="/impressum" component={Impressum} />
          <Route path="/datenschutz" component={Datenschutz} />
          <Route path="/agb" component={AGB} />
          
          {/* Auth */}
          <Route path="/login" component={Login} />
          <Route path="/login-otp-request" component={LoginOTPRequest} />
          <Route path="/login-otp-verify" component={LoginOTPVerify} />
          <Route path="/register" component={Register} />
          <Route path="/register-verify" component={RegisterVerify} />
          
          {/* Workflow/Portal */}
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/intake" component={Intake} />
          <Route path="/review/:jobId/:shootId" component={Review} />
          <Route path="/order-form" component={OrderForm} />
          <Route path="/preisliste" component={Preisliste} />
          <Route path="/galerie" component={Galerie} />
          <Route path="/demo-jobs" component={DemoJobs} />
          <Route path="/demo-job-detail/:id" component={DemoJobDetail} />
          <Route path="/demo-upload" component={DemoUpload} />
          <Route path="/downloads" component={Downloads} />
          <Route path="/upload-editing-team" component={UploadEditingTeam} />
          <Route path="/eingegangene-uploads" component={EingegangeneUploads} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          
          {/* Admin */}
          <Route path="/admin/editorial" component={AdminEditorial} />
          <Route path="/admin/seo" component={AdminSEO} />
          <Route path="/ai-lab" component={AILab} />
          <Route path="/gallery-classify" component={GalleryClassify} />
          
          {/* New Workflow pages */}
          <Route path="/qc-dashboard" component={QCDashboard} />
          <Route path="/qc-quality-check" component={QCQualityCheck} />
          <Route path="/editor-dashboard" component={EditorDashboard} />
          <Route path="/editor-job-detail" component={EditorJobDetail} />
          <Route path="/admin-editor-management" component={AdminEditorManagement} />
          <Route path="/editor-revision" component={EditorRevision} />
          <Route path="/delivery-prep" component={DeliveryPrep} />
          <Route path="/upload-status" component={UploadStatus} />
          <Route path="/mini-gallery" component={MiniGallery} />
          <Route path="/settings" component={Settings} />
          <Route path="/invoices" component={Invoices} />
          
          {/* Docs */}
          <Route path="/docs/rooms-spec" component={DocsRoomsSpec} />
          <Route path="/dev-notes-qc" component={DevNotesQC} />
          
          {/* Dev Hub */}
          <Route path="/dev" component={DevIndex} />
          <Route path="/dev/reset-app" component={DevResetApp} />
          <Route path="/demo-push-notifications" component={DemoPushNotifications} />
          
          {/* PixCapture iPhone App */}
          <Route path="/pixcapture-app" component={AppSplash} />
          <Route path="/pixcapture-app/firstlaunch" component={AppSplashFirstLaunch} />
          <Route path="/pixcapture-app/verify" component={AppVerifyUser} />
          <Route path="/pixcapture-app/login" component={AppLogin} />
          <Route path="/pixcapture-app/jobs" component={AppJobs} />
          <Route path="/pixcapture-app/job-new" component={AppJobNew} />
          <Route path="/pixcapture-app/camera" component={AppCamera} />
          <Route path="/pixcapture-app/camera-landscape" component={AppCameraLandscapeDemo} />
          <Route path="/pixcapture-app/gallery" component={AppGallery} />
          <Route path="/pixcapture-app/upload" component={AppUpload} />
          <Route path="/pixcapture-app/notifications" component={AppNotifications} />
          <Route path="/pixcapture-app/settings" component={AppSettings} />
          <Route path="/pixcapture-app/overview" component={AppIndex} />
          <Route path="/pixcapture-app/nav" component={AppNav} />
          
          {/* App Upload (standalone routes) */}
          <Route path="/app-upload" component={AppUpload} />
          <Route path="/app-login" component={AppLogin} />
          <Route path="/app-jobs" component={AppJobs} />
          <Route path="/app-settings" component={AppSettings} />
          <Route path="/app-gallery" component={AppGallery} />
          <Route path="/app-notifications" component={AppNotifications} />
          
          {/* PixCapture.app (Self-Service Platform) */}
          <Route path="/pixcapture" component={PixCaptureHome} />
          <Route path="/pixcapture-home" component={PixCaptureHome} />
          <Route path="/pixcapture-about" component={PixCaptureAbout} />
          <Route path="/pixcapture-impressum" component={PixCaptureImpressum} />
          <Route path="/pixcapture-datenschutz" component={PixCaptureDatenschutz} />
          <Route path="/pixcapture-agb" component={PixCaptureAGB} />
          <Route path="/pixcapture-help" component={PixCaptureHelp} />
          <Route path="/pixcapture-expert-call" component={PixCaptureExpertCall} />
          
          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      
      <Toaster />
    </>
  );
}
