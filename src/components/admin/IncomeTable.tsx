import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Eye, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IncomeRecord {
  id: string;
  service_type: string;
  cost: number | null;
  description: string | null;
  image_urls: string[] | null;
  customers: {
    name: string;
    phone: string | null;
    vehicle_make: string | null;
    vehicle_model: string | null;
  } | null;
}

interface IncomeTableProps {
  selectedDate: string;
  refreshTrigger: number;
}

const IncomeTable = ({ selectedDate, refreshTrigger }: IncomeTableProps) => {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, refreshTrigger]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_history')
      .select(`
        id,
        service_type,
        cost,
        description,
        image_urls,
        customers (
          name,
          phone,
          vehicle_make,
          vehicle_model
        )
      `)
      .eq('service_date', selectedDate)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('کیا آپ واقعی delete کرنا چاہتے ہیں؟')) return;

    const { error } = await supabase
      .from('service_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Entry delete ho gai",
      });
      fetchRecords();
    }
  };

  const totalIncome = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              آج کی آمدنی (Income Table)
            </span>
            <span className="text-green-600">PKR {totalIncome.toLocaleString()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              آج کوئی entry نہیں ہے
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.customers?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {record.customers?.vehicle_make} {record.customers?.vehicle_model}
                      </TableCell>
                      <TableCell>{record.service_type}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        PKR {record.cost?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive hover:text-destructive"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedRecord.customers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRecord.customers?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Car</p>
                  <p className="font-medium">
                    {selectedRecord.customers?.vehicle_make} {selectedRecord.customers?.vehicle_model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedRecord.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-green-600">PKR {selectedRecord.cost?.toLocaleString()}</p>
                </div>
              </div>
              
              {selectedRecord.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedRecord.description}</p>
                </div>
              )}

              {selectedRecord.image_urls && selectedRecord.image_urls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Receipt/Bill</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRecord.image_urls.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Receipt ${index + 1}`}
                          className="h-24 w-24 object-cover rounded border hover:opacity-80"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IncomeTable;
