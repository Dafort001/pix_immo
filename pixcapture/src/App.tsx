import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Home from "./pages/home";
import About from "./pages/about";
import AGB from "./pages/agb";
import Datenschutz from "./pages/datenschutz";
import ExpertCall from "./pages/expert-call";
import Help from "./pages/help";
import Impressum from "./pages/impressum";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/agb" component={AGB} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/expert-call" component={ExpertCall} />
      <Route path="/help" component={Help} />
      <Route path="/impressum" component={Impressum} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
