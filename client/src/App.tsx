import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Invoices from "./pages/Invoices";
import Currency from "./pages/Currency";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/products" component={Products} />
      <Route path="/leads" component={Leads} />
      <Route path="/pipeline" component={Pipeline} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/currency" component={Currency} />
      <Route path="/export" component={Export} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
