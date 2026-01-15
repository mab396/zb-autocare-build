import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Eye, Printer, Car, Phone, History } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  license_plate: string | null;
}

interface ServiceRecord {
  id: string;
  service_date: string;
  service_type: string;
  cost: number | null;
  description: string | null;
}

const CustomerSearch = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, vehicle_make, vehicle_model, license_plate')
      .order('name');

    if (!error && data) {
      setCustomers(data);
    }
    setIsLoading(false);
  };

  const viewCustomerHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    
    const { data, error } = await supabase
      .from('service_history')
      .select('id, service_date, service_type, cost, description')
      .eq('customer_id', customer.id)
      .order('service_date', { ascending: false });

    if (!error && data) {
      setServiceHistory(data);
      const total = data.reduce((sum, s) => sum + (s.cost || 0), 0);
      setTotalSpent(total);
    }
    
    setIsDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            کسٹمر تلاش کریں (Customer Search)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="نام، فون نمبر، یا گاڑی نمبر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm.length >= 2 && (
              <div className="max-h-[400px] overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    کوئی کسٹمر نہیں ملا
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => viewCustomerHistory(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.vehicle_make} {customer.vehicle_model} | {customer.license_plate || 'No plate'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {searchTerm.length < 2 && (
              <p className="text-center py-4 text-muted-foreground text-sm">
                کم از کم 2 حروف لکھیں
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {selectedCustomer?.name} - History
              </span>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCustomer.vehicle_make} {selectedCustomer.vehicle_model}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Total Amount Spent:</span>
                <span className="text-xl font-bold text-green-600">
                  PKR {totalSpent.toLocaleString()}
                </span>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Service History ({serviceHistory.length} visits)
                </h4>
                {serviceHistory.length === 0 ? (
                  <p className="text-muted-foreground">No service records</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            {new Date(service.service_date).toLocaleDateString('en-PK')}
                          </TableCell>
                          <TableCell>{service.service_type}</TableCell>
                          <TableCell className="text-right font-medium">
                            PKR {service.cost?.toLocaleString() || '0'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerSearch;
