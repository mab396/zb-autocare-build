import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Minus, Upload, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
}

interface ExpenseEntryProps {
  selectedDate: string;
  onEntryAdded: () => void;
}

const ExpenseEntry = ({ selectedDate, onEntryAdded }: ExpenseEntryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [salaryForm, setSalaryForm] = useState({
    employee_id: '',
    amount: '',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, role, salary')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setEmployees(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { error } = await supabase
        .from('salary_payments')
        .insert({
          employee_id: salaryForm.employee_id,
          amount: parseFloat(salaryForm.amount),
          payment_date: selectedDate,
          notes: salaryForm.notes,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "کامیاب!",
        description: "Salary payment add ho gai",
      });

      setSalaryForm({ employee_id: '', amount: '', notes: '' });
      onEntryAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { error } = await supabase
        .from('marketing_expenses')
        .insert({
          title: expenseForm.title,
          amount: parseFloat(expenseForm.amount),
          expense_date: selectedDate,
          category: expenseForm.category,
          notes: expenseForm.notes,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "کامیاب!",
        description: "Expense add ho gai",
      });

      setExpenseForm({ title: '', amount: '', category: '', notes: '' });
      setSelectedImage(null);
      setImagePreview(null);
      onEntryAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Minus className="h-5 w-5 text-red-600" />
          <span>اخراجات (Expense Entry)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="salary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="salary">Salary تنخواہ</TabsTrigger>
            <TabsTrigger value="expense">Other Expense</TabsTrigger>
          </TabsList>
          
          <TabsContent value="salary">
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select
                  value={salaryForm.employee_id}
                  onValueChange={(value) => {
                    const emp = employees.find(e => e.id === value);
                    setSalaryForm(prev => ({
                      ...prev,
                      employee_id: value,
                      amount: emp ? emp.salary.toString() : '',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_amount">Amount (PKR)</Label>
                <Input
                  id="salary_amount"
                  type="number"
                  value={salaryForm.amount}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_notes">Notes</Label>
                <Input
                  id="salary_notes"
                  value={salaryForm.notes}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes..."
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !salaryForm.employee_id || !salaryForm.amount} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Adding...' : 'Add Salary Payment'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="expense">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense_title">Expense Title *</Label>
                <Input
                  id="expense_title"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Electricity Bill"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_category">Category</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electricity">Electricity Bill</SelectItem>
                    <SelectItem value="Rent">Rent کرایہ</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Social Media">Social Media Agency</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_amount">Amount (PKR) *</Label>
                <Input
                  id="expense_amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_notes">Notes</Label>
                <Input
                  id="expense_notes"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes..."
                />
              </div>

              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Receipt" className="h-16 w-16 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="expense-image-upload"
                />
                <Label
                  htmlFor="expense-image-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Receipt
                </Label>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !expenseForm.title || !expenseForm.amount} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExpenseEntry;
