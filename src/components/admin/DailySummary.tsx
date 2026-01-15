import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';

interface DailySummaryProps {
  selectedDate: string;
  refreshTrigger: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  marketingBudget: number;
  dailyProfit: number;
}

const DailySummary = ({ selectedDate, refreshTrigger }: DailySummaryProps) => {
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    marketingBudget: 0,
    dailyProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailySummary();
  }, [selectedDate, refreshTrigger]);

  const fetchDailySummary = async () => {
    setIsLoading(true);
    try {
      // Fetch income from service_history for selected date
      const { data: incomeData } = await supabase
        .from('service_history')
        .select('cost')
        .eq('service_date', selectedDate);

      const totalIncome = incomeData?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

      // Fetch salary payments for selected date
      const { data: salaryData } = await supabase
        .from('salary_payments')
        .select('amount')
        .eq('payment_date', selectedDate);

      const salaryExpenses = salaryData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      // Fetch marketing expenses for selected date
      const { data: marketingData } = await supabase
        .from('marketing_expenses')
        .select('amount')
        .eq('expense_date', selectedDate);

      const marketingExpenses = marketingData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      const totalExpenses = salaryExpenses;
      const dailyProfit = totalIncome - totalExpenses - marketingExpenses;

      setSummary({
        totalIncome,
        totalExpenses,
        marketingBudget: marketingExpenses,
        dailyProfit,
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: 'آمدنی (Income)',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'اخراجات (Expenses)',
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'مارکیٹنگ (Marketing)',
      value: summary.marketingBudget,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'منافع (Profit)',
      value: summary.dailyProfit,
      icon: Wallet,
      color: summary.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.dailyProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-none`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground urdu-text">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  PKR {card.value.toLocaleString()}
                </p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DailySummary;
