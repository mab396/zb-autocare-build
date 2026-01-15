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
import { Plus, Upload, X } from 'lucide-react';

interface IncomeEntryProps {
  selectedDate: string;
  onEntryAdded: () => void;
}

const IncomeEntry = ({ selectedDate, onEntryAdded }: IncomeEntryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    contact: '',
    car: '',
    current_km: '',
    service_type: '',
    service_notes: '',
    source: '',
    amount: '',
  });

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

      // First, create or find customer
      let customerId: string;
      
      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('name', formData.customer_name)
        .eq('phone', formData.contact)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: formData.customer_name,
            phone: formData.contact,
            vehicle_make: formData.car,
            notes: `Source: ${formData.source}`,
            user_id: user.id,
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Upload images
      const imageUrls = await uploadImages();

      // Create service entry
      const { error: serviceError } = await supabase
        .from('service_history')
        .insert({
          customer_id: customerId,
          service_date: selectedDate,
          service_type: formData.service_type,
          description: `${formData.service_notes}\nKM: ${formData.current_km}\nSource: ${formData.source}`,
          cost: parseFloat(formData.amount) || 0,
          image_urls: imageUrls,
          status: 'completed',
          user_id: user.id,
        });

      if (serviceError) throw serviceError;

      toast({
        title: "کامیاب!",
        description: "Entry add ho gai hai",
      });

      // Reset form
      setFormData({
        customer_name: '',
        contact: '',
        car: '',
        current_km: '',
        service_type: '',
        service_notes: '',
        source: '',
        amount: '',
      });
      setSelectedImages([]);
      setImagePreviews([]);

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
          <Plus className="h-5 w-5 text-green-600" />
          <span>آمدنی (Income Entry)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="نام لکھیں"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="0300-1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car">Car</Label>
              <Input
                id="car"
                name="car"
                value={formData.car}
                onChange={handleChange}
                placeholder="Toyota Corolla"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_km">Current KM</Label>
              <Input
                id="current_km"
                name="current_km"
                type="number"
                value={formData.current_km}
                onChange={handleChange}
                placeholder="75000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => handleSelectChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Service">General Service</SelectItem>
                  <SelectItem value="Oil Change">Oil Change</SelectItem>
                  <SelectItem value="Brake Service">Brake Service</SelectItem>
                  <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                  <SelectItem value="Transmission">Transmission</SelectItem>
                  <SelectItem value="AC Service">AC Service</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                  <SelectItem value="Tuning">Tuning</SelectItem>
                  <SelectItem value="Gearbox">Gearbox</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Customer Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleSelectChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="کہاں سے آیا؟" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Repeat Customer">Repeat Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="5000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_notes">Service Notes</Label>
            <Textarea
              id="service_notes"
              name="service_notes"
              value={formData.service_notes}
              onChange={handleChange}
              placeholder="کام کی تفصیل..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt/Bill Photo</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-16 w-16 object-cover rounded border"
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
                id="income-image-upload"
              />
              <Label
                htmlFor="income-image-upload"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted text-sm"
              >
                <Upload className="h-4 w-4" />
                Upload Receipt
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !formData.customer_name || !formData.service_type || !formData.amount} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Adding...' : 'Add Entry ایڈ کریں'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncomeEntry;
