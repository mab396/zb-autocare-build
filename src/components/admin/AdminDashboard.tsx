import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailySummary from './DailySummary';
import IncomeEntry from './IncomeEntry';
import ExpenseEntry from './ExpenseEntry';
import IncomeTable from './IncomeTable';
import CustomerSearch from './CustomerSearch';
import EmployeeManagement from './EmployeeManagement';
import MonthlySummary from './MonthlySummary';
import { 
  LogOut, 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Search,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAdminAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ZB AutoCare</h1>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Date Selector */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-none shadow-none text-center font-medium"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-1">
            {formatDateDisplay(selectedDate)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Daily Summary Cards */}
        <DailySummary selectedDate={selectedDate} refreshTrigger={refreshTrigger} />

        {/* Monthly Summary */}
        <MonthlySummary selectedDate={selectedDate} refreshTrigger={refreshTrigger} />

        {/* Main Tabs */}
        <Tabs defaultValue="data-entry" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="data-entry" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Entry</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Expense</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-entry" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IncomeEntry selectedDate={selectedDate} onEntryAdded={handleRefresh} />
              <IncomeTable selectedDate={selectedDate} refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <CustomerSearch />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseEntry selectedDate={selectedDate} onEntryAdded={handleRefresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
