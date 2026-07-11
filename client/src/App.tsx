import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ScenarioProvider } from "./contexts/ScenarioContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import Home from "./pages/Home";
import TermsOfService from "./pages/TermsOfService";

function Router() {
  return (
    // BASE_URL tracks vite's `base` in dev/preview/build; wouter wants it without a trailing slash.
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/terms"} component={TermsOfService} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ScenarioProvider>
        <OnboardingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </OnboardingProvider>
      </ScenarioProvider>
    </ErrorBoundary>
  );
}

export default App;
