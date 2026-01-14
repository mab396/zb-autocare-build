import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface CustomerFormProps {
  onCustomerAdded: () => void;
}

const CustomerForm = ({ onCustomerAdded }: CustomerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          ...formData,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer added successfully",
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: '',
        license_plate: '',
        notes: '',
      });

      onCustomerAdded();
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Customer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                placeholder="ABC-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_make">Vehicle Make</Label>
              <Input
                id="vehicle_make"
                name="vehicle_make"
                value={formData.vehicle_make}
                onChange={handleChange}
                placeholder="Toyota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Input
                id="vehicle_model"
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleChange}
                placeholder="Corolla"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_year">Vehicle Year</Label>
              <Input
                id="vehicle_year"
                name="vehicle_year"
                value={formData.vehicle_year}
                onChange={handleChange}
                placeholder="2020"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the customer..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Adding...' : 'Add Customer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
