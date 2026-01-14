import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Upload, X } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  license_plate: string | null;
}

interface ServiceHistoryFormProps {
  onServiceAdded: () => void;
}

const ServiceHistoryForm = ({ onServiceAdded }: ServiceHistoryFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    service_date: new Date().toISOString().split('T')[0],
    service_type: '',
    description: '',
    cost: '',
    parts_used: '',
    technician: '',
    status: 'completed',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, vehicle_make, vehicle_model, license_plate')
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `service-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
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

      // Upload images first
      const imageUrls = await uploadImages();

      const { error } = await supabase
        .from('service_history')
        .insert({
          customer_id: formData.customer_id,
          service_date: formData.service_date,
          service_type: formData.service_type,
          description: formData.description,
          cost: parseFloat(formData.cost) || 0,
          parts_used: formData.parts_used,
          technician: formData.technician,
          status: formData.status,
          image_urls: imageUrls,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service record added successfully",
      });

      setFormData({
        customer_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_type: '',
        description: '',
        cost: '',
        parts_used: '',
        technician: '',
        status: 'completed',
      });
      setSelectedImages([]);
      setImagePreviews([]);

      onServiceAdded();
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
          <Wrench className="h-5 w-5" />
          Add Service Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Select Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleSelectChange('customer_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.vehicle_make} {customer.vehicle_model} ({customer.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_date">Service Date *</Label>
              <Input
                id="service_date"
                name="service_date"
                type="date"
                value={formData.service_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => handleSelectChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oil Change">Oil Change</SelectItem>
                  <SelectItem value="Brake Service">Brake Service</SelectItem>
                  <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                  <SelectItem value="Transmission">Transmission</SelectItem>
                  <SelectItem value="AC Service">AC Service</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                  <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (PKR)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Input
                id="technician"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                placeholder="Technician name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parts_used">Parts Used</Label>
            <Input
              id="parts_used"
              name="parts_used"
              value={formData.parts_used}
              onChange={handleChange}
              placeholder="List of parts used..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the service..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Service Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !formData.customer_id || !formData.service_type} className="w-full">
            {isLoading ? 'Adding...' : 'Add Service Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceHistoryForm;
