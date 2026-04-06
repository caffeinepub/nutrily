import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { useLocalAuth } from "./hooks/useLocalAuth";

export default function App() {
  const { user, isLoggedIn, login } = useLocalAuth();
  const [adminRole, setAdminRole] = useState<string>("");

  // Admin access check must come BEFORE the login check
  // because admin enters via the login page without being a regular user
  if (adminRole) {
    return (
      <>
        <AdminDashboard onExit={() => setAdminRole("")} adminRole={adminRole} />
        <Toaster />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage
          onAdminAccess={(role?: string) => setAdminRole(role ?? "superAdmin")}
          onLogin={login}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Dashboard userName={user?.name ?? "User"} />
      <Toaster />
    </>
  );
}
