import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Login } from "./components/Login";
import SubscriptionGate from "./components/SubscriptionGate";
import PermissionGate from "./components/PermissionGate";

// Pages
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Invoices from "./pages/Invoices";
import Currency from "./pages/Currency";
import Export from "./pages/Export";
import Reports from "./pages/Reports";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import UserManagement from "./pages/UserManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/app/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/products" component={Products} />
        <Route path="/leads" component={Leads} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/currency" component={Currency} />
        <Route path="/export" component={() => <SubscriptionGate><Export /></SubscriptionGate>} />
        <Route path="/reports" component={() => <SubscriptionGate><Reports /></SubscriptionGate>} />
        <Route path="/files" component={() => <SubscriptionGate><Files /></SubscriptionGate>} />
        <Route path="/settings" component={Settings} />
        <Route path="/billing" component={Billing} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/users" component={() => <SubscriptionGate><UserManagement /></SubscriptionGate>} />
        <Route path="/employees" component={() => <SubscriptionGate><EmployeeManagement /></SubscriptionGate>} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function AppContent() {
  const { settings, auth } = useApp();
  const isConfigured = Boolean(settings.settings.isConfigured);

  // We can't use a hook like useLocation inside AppContent if it's outside the Router.
  // But for simplicity, let's check if the current path is for public pages.
  const isPublicPage = window.location.hash === '' || window.location.hash === '#/app/register';

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

  if (isPublicPage) {
    return (
      <>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  if (!isConfigured) {
    // If they are authenticated but not configured, they might be in the onboarding phase.
    // We can either show Login or a separate onboarding page.
    // For now, let's keep showing Login or redirect to settings.
    return <Login />;
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
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
