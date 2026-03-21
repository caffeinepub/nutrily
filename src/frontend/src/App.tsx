import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const isLoadingAll =
    isInitializing ||
    (isAuthenticated && profileLoading && !isFetched) ||
    (isAuthenticated &&
      isFetched &&
      userProfile !== null &&
      adminLoading &&
      isAdmin === undefined);

  if (isLoadingAll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (showProfileSetup) {
    return (
      <>
        <ProfileSetup />
        <Toaster />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Dashboard userName={userProfile?.name ?? "User"} />
      <Toaster />
    </>
  );
}
