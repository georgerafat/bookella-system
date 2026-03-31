import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Borrowing from "./pages/Borrowing";
import CreateOrderAdvanced from "./pages/CreateOrderAdvanced";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path="/books">
        <DashboardLayout>
          <Books />
        </DashboardLayout>
      </Route>
      <Route path="/orders">
        <DashboardLayout>
          <Orders />
        </DashboardLayout>
      </Route>
      <Route path="/customers">
        <DashboardLayout>
          <Customers />
        </DashboardLayout>
      </Route>
      <Route path="/borrowing">
        <DashboardLayout>
          <Borrowing />
        </DashboardLayout>
      </Route>
      <Route path="/create-order">
        <DashboardLayout>
          <CreateOrderAdvanced />
        </DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div dir="rtl">
            <Toaster position="top-center" />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
