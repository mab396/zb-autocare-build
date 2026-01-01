-- Create table for GMB reviews
CREATE TABLE public.gmb_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id TEXT UNIQUE NOT NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_time TIMESTAMP WITH TIME ZONE,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for GMB photos
CREATE TABLE public.gmb_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT UNIQUE NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for sync status
CREATE TABLE public.gmb_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_sync_status ENABLE ROW LEVEL SECURITY;

-- Create public read policies (anyone can view reviews and photos)
CREATE POLICY "Reviews are publicly viewable" 
ON public.gmb_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Photos are publicly viewable" 
ON public.gmb_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Sync status is publicly viewable" 
ON public.gmb_sync_status 
FOR SELECT 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_gmb_reviews_updated_at
BEFORE UPDATE ON public.gmb_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gmb_sync_status_updated_at
BEFORE UPDATE ON public.gmb_sync_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();