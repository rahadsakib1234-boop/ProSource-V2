import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Login } from "./components/Login";

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
import UserManagement from "./pages/UserManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
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
      <Route path="/reports" component={Export} />
      <Route path="/files" component={Export} />
      <Route path="/settings" component={Settings} />
      <Route path="/users" component={UserManagement} />
      <Route path="/employees" component={EmployeeManagement} />
      <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function AppContent() {
  const { settings, auth } = useApp();

  if (settings.loading || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading ProSource CRM...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
