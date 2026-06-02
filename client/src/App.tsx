import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ScenarioProvider } from "./contexts/ScenarioContext";
import Home from "./pages/Home";
import TermsOfService from "./pages/TermsOfService";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <ScenarioProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ScenarioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
