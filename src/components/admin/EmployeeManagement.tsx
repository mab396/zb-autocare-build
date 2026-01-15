import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Edit } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    salary: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEmployees(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            role: formData.role,
            salary: parseFloat(formData.salary),
            phone: formData.phone || null,
            email: formData.email || null,
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
        toast({ title: "Updated!", description: "Employee updated" });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert({
            name: formData.name,
            role: formData.role,
            salary: parseFloat(formData.salary),
            phone: formData.phone || null,
            email: formData.email || null,
            user_id: user.id,
          });

        if (error) throw error;
        toast({ title: "Added!", description: "Employee added" });
      }

      setFormData({ name: '', role: '', salary: '', phone: '', email: '' });
      setEditingEmployee(null);
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      salary: employee.salary.toString(),
      phone: employee.phone || '',
      email: employee.email || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Employee removed" });
      fetchEmployees();
    }
  };

  const toggleActive = async (employee: Employee) => {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: !employee.is_active })
      .eq('id', employee.id);

    if (!error) {
      fetchEmployees();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ملازمین (Employees)
          </span>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingEmployee(null);
              setFormData({ name: '', role: '', salary: '', phone: '', email: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_name">Name *</Label>
                  <Input
                    id="emp_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Employee name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_role">Role *</Label>
                  <Input
                    id="emp_role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Mechanic, Helper"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_salary">Monthly Salary (PKR) *</Label>
                  <Input
                    id="emp_salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="25000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_phone">Phone</Label>
                  <Input
                    id="emp_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0300-1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_email">Email</Label>
                  <Input
                    id="emp_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="employee@email.com"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No employees added yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} className={!emp.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>PKR {emp.salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(emp)}
                        className={emp.is_active ? 'text-green-600' : 'text-red-600'}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(emp.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeManagement;
