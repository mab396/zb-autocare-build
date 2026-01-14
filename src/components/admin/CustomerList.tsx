import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Eye, Trash2, Car } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: string | null;
  license_plate: string | null;
  notes: string | null;
  created_at: string;
}

interface ServiceRecord {
  id: string;
  service_date: string;
  service_type: string;
  description: string | null;
  cost: number | null;
  status: string | null;
  image_urls: string[] | null;
}

interface CustomerListProps {
  refreshTrigger: number;
}

const CustomerList = ({ refreshTrigger }: CustomerListProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } else {
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    }
    setIsLoading(false);
  };

  const fetchServiceHistory = async (customerId: string) => {
    const { data, error } = await supabase
      .from('service_history')
      .select('*')
      .eq('customer_id', customerId)
      .order('service_date', { ascending: false });

    if (error) {
      console.error('Error fetching service history:', error);
    } else {
      setServiceHistory(data || []);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchServiceHistory(customer.id);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all their service history.')) {
      return;
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      fetchCustomers();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer List ({filteredCustomers.length})
            </span>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, vehicle, or plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>
                        {customer.vehicle_make && customer.vehicle_model
                          ? `${customer.vehicle_make} ${customer.vehicle_model} ${customer.vehicle_year || ''}`
                          : '-'}
                      </TableCell>
                      <TableCell>{customer.license_plate || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {selectedCustomer?.name} - Service History
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {selectedCustomer.vehicle_make} {selectedCustomer.vehicle_model} {selectedCustomer.vehicle_year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{selectedCustomer.license_plate || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service History ({serviceHistory.length})</h4>
                {serviceHistory.length === 0 ? (
                  <p className="text-muted-foreground">No service records found</p>
                ) : (
                  <div className="space-y-3">
                    {serviceHistory.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{service.service_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(service.service_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">PKR {service.cost?.toLocaleString() || '0'}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              service.status === 'completed' ? 'bg-green-100 text-green-800' :
                              service.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {service.status}
                            </span>
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        )}
                        {service.image_urls && service.image_urls.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {service.image_urls.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={url}
                                  alt={`Service image ${index + 1}`}
                                  className="h-16 w-16 object-cover rounded border hover:opacity-80"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerList;
