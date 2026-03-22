import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { useLocalAuth } from "./hooks/useLocalAuth";

export default function App() {
  const { user, isLoggedIn } = useLocalAuth();
  const [adminAccessGranted, setAdminAccessGranted] = useState(false);

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onAdminAccess={() => setAdminAccessGranted(true)} />
        <Toaster />
      </>
    );
  }

  if (adminAccessGranted) {
    return (
      <>
        <AdminDashboard />
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
