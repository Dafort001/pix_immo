import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { FEATURE_QA_GUARD } from "@/config/flags";
import { RollbackBanner } from "@/components/RollbackBanner";
import { useSmokeChecks } from "@/hooks/useSmokeChecks";
import Home from "./pages/home";
import About from "./pages/about";
import Blog from "./pages/blog";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import AGB from "./pages/agb";
import Datenschutz from "./pages/datenschutz";
import Help from "./pages/help";
import Impressum from "./pages/impressum";
import NotFound from "./pages/not-found";
import QAPage from "@/routes/qa";

function Router() {
  return (
    <Switch>
      <Route path="/pixcapture" component={Home} />
      <Route path="/pixcapture/about" component={About} />
      <Route path="/pixcapture/blog" component={Blog} />
      <Route path="/pixcapture/login" component={Login} />
      <Route path="/pixcapture/register" component={Register} />
      <Route path="/pixcapture/dashboard" component={Dashboard} />
      <Route path="/pixcapture/agb" component={AGB} />
      <Route path="/pixcapture/datenschutz" component={Datenschutz} />
      <Route path="/pixcapture/help" component={Help} />
      <Route path="/pixcapture/impressum" component={Impressum} />
      {FEATURE_QA_GUARD && <Route path="/pixcapture/qa" component={QAPage} />}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { hasFailures } = useSmokeChecks();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {FEATURE_QA_GUARD && <RollbackBanner visible={hasFailures} />}
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
