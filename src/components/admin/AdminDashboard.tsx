import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerForm from './CustomerForm';
import ServiceHistoryForm from './ServiceHistoryForm';
import CustomerList from './CustomerList';
import { LogOut, UserPlus, Wrench, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAdminAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">ZB AutoCare Admin</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="add-customer" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
            </TabsTrigger>
            <TabsTrigger value="add-service" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Add Service</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomerList refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="add-customer">
            <CustomerForm onCustomerAdded={handleRefresh} />
          </TabsContent>

          <TabsContent value="add-service">
            <ServiceHistoryForm onServiceAdded={handleRefresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
