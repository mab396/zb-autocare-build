import { useAdminAuth, AdminAuthProvider } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

const TrackerContent = () => {
  const { user, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login
  if (!user) {
    return <AdminLogin />;
  }

  // Logged in but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin access to this dashboard. Please contact the administrator to get access.
          </p>
          <p className="text-sm text-muted-foreground">
            Logged in as: {user.email}
          </p>
        </div>
      </div>
    );
  }

  // Admin user - show dashboard
  return <AdminDashboard />;
};

const Tracker = () => {
  return (
    <AdminAuthProvider>
      <TrackerContent />
    </AdminAuthProvider>
  );
};

export default Tracker;
