import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { useLocalAuth } from "./hooks/useLocalAuth";

export default function App() {
  const { user, isLoggedIn, login } = useLocalAuth();
  const [adminAccessGranted, setAdminAccessGranted] = useState(false);

  // Admin access check must come BEFORE the login check
  // because admin enters via the login page without being a regular user
  if (adminAccessGranted) {
    return (
      <>
        <AdminDashboard onExit={() => setAdminAccessGranted(false)} />
        <Toaster />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage
          onAdminAccess={() => setAdminAccessGranted(true)}
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
