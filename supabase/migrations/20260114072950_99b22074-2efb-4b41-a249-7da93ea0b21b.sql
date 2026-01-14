-- Create app_role enum for user roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create customers table for service tracking
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text,
    email text,
    vehicle_make text,
    vehicle_model text,
    vehicle_year text,
    license_plate text,
    notes text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create service_history table
CREATE TABLE public.service_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    service_date date NOT NULL DEFAULT CURRENT_DATE,
    service_type text NOT NULL,
    description text,
    cost numeric DEFAULT 0,
    parts_used text,
    technician text,
    status text DEFAULT 'completed',
    image_urls text[],
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text NOT NULL,
    salary numeric NOT NULL DEFAULT 0,
    email text,
    phone text,
    is_active boolean NOT NULL DEFAULT true,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create salary_payments table
CREATE TABLE public.salary_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    notes text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create marketing_expenses table
CREATE TABLE public.marketing_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    amount numeric NOT NULL,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    category text,
    notes text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_expenses ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for customers (admin only)
CREATE POLICY "Admins can view all customers" ON public.customers
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers" ON public.customers
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers" ON public.customers
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers" ON public.customers
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_history (admin only)
CREATE POLICY "Admins can view all service history" ON public.service_history
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert service history" ON public.service_history
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service history" ON public.service_history
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service history" ON public.service_history
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employees (admin only)
CREATE POLICY "Admins can view all employees" ON public.employees
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert employees" ON public.employees
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees" ON public.employees
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees" ON public.employees
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for salary_payments (admin only)
CREATE POLICY "Admins can view all salary payments" ON public.salary_payments
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert salary payments" ON public.salary_payments
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete salary payments" ON public.salary_payments
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for marketing_expenses (admin only)
CREATE POLICY "Admins can view all marketing expenses" ON public.marketing_expenses
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert marketing expenses" ON public.marketing_expenses
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete marketing expenses" ON public.marketing_expenses
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for service images
CREATE POLICY "Anyone can view service images" ON storage.objects
    FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated users can upload service images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete service images" ON storage.objects
    FOR DELETE USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER set_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_service_history_updated_at
    BEFORE UPDATE ON public.service_history
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();