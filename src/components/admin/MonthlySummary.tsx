import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Wallet, Calendar } from 'lucide-react';

interface MonthlySummaryProps {
  selectedDate: string;
  refreshTrigger: number;
}

const MonthlySummary = ({ selectedDate, refreshTrigger }: MonthlySummaryProps) => {
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    marketing: 0,
    profit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const monthName = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedDate, refreshTrigger]);

  const fetchMonthlySummary = async () => {
    setIsLoading(true);
    try {
      const date = new Date(selectedDate);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      // Income
      const { data: incomeData } = await supabase
        .from('service_history')
        .select('cost')
        .gte('service_date', startOfMonth)
        .lte('service_date', endOfMonth);

      const income = incomeData?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

      // Salary expenses
      const { data: salaryData } = await supabase
        .from('salary_payments')
        .select('amount')
        .gte('payment_date', startOfMonth)
        .lte('payment_date', endOfMonth);

      const salaryExpenses = salaryData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      // Marketing expenses
      const { data: marketingData } = await supabase
        .from('marketing_expenses')
        .select('amount')
        .gte('expense_date', startOfMonth)
        .lte('expense_date', endOfMonth);

      const marketing = marketingData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      const expenses = salaryExpenses;
      const profit = income - expenses - marketing;

      setSummary({ income, expenses, marketing, profit });
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          ماہانہ (Monthly) - {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Income</span>
            </div>
            <p className="text-xl font-bold">PKR {summary.income.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-red-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Expenses</span>
            </div>
            <p className="text-xl font-bold">PKR {summary.expenses.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-blue-400">
              <Target className="h-4 w-4" />
              <span className="text-xs">Marketing</span>
            </div>
            <p className="text-xl font-bold">PKR {summary.marketing.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className={`flex items-center gap-1 ${summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Profit</span>
            </div>
            <p className="text-xl font-bold">PKR {summary.profit.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySummary;
