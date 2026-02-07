-- Create sensor_readings table for Raspberry Pi Pico hardware data
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Temperature from MPU6050
  temperature REAL NOT NULL DEFAULT 0,
  
  -- Smoke sensor data
  smoke_level REAL NOT NULL DEFAULT 0,
  smoke_ppm REAL DEFAULT 0,
  smoke_status TEXT DEFAULT 'SAFE',
  
  -- Fire sensor data
  fire_detected BOOLEAN NOT NULL DEFAULT false,
  fire_intensity REAL DEFAULT 0,
  fire_level TEXT DEFAULT 'SAFE',
  
  -- MPU6050 accelerometer data
  accel_x REAL DEFAULT 0,
  accel_y REAL DEFAULT 0,
  accel_z REAL DEFAULT 0,
  accel_magnitude REAL DEFAULT 1,
  pitch REAL DEFAULT 0,
  roll REAL DEFAULT 0,
  
  -- Movement status
  movement_status TEXT NOT NULL DEFAULT 'NORMAL',
  
  -- Overall danger level
  danger_level TEXT DEFAULT 'SAFE',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allowing public inserts for the hardware bridge)
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sensor data (public dashboard)
CREATE POLICY "Anyone can read sensor readings"
  ON public.sensor_readings
  FOR SELECT
  USING (true);

-- Allow anyone to insert sensor data (from Python bridge script)
CREATE POLICY "Anyone can insert sensor readings"
  ON public.sensor_readings
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

-- Create index for faster time-based queries
CREATE INDEX idx_sensor_readings_created_at ON public.sensor_readings (created_at DESC);