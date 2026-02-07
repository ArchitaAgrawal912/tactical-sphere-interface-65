import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SensorReading {
  id: string;
  temperature: number;
  smoke_level: number;
  smoke_ppm: number | null;
  smoke_status: string | null;
  fire_detected: boolean;
  fire_intensity: number | null;
  fire_level: string | null;
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  accel_magnitude: number | null;
  pitch: number | null;
  roll: number | null;
  movement_status: string;
  danger_level: string | null;
  created_at: string;
}

export const useSensorData = () => {
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchLatest = useCallback(async () => {
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      setError(error.message);
      return;
    }

    if (data && data.length > 0) {
      setLatestReading(data[0] as SensorReading);
      setReadings(data as SensorReading[]);
    }
  }, []);

  useEffect(() => {
    // Fetch initial data
    fetchLatest();

    // Set up realtime subscription
    const channel = supabase
      .channel("sensor_readings_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReading(newReading);
          setReadings((prev) => [newReading, ...prev].slice(0, 30));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLatest]);

  // Derived states for UI components
  const sensorStatus = {
    // Temperature (from MPU6050)
    temperature: latestReading?.temperature ?? 0,
    
    // Smoke sensor
    smokeLevel: latestReading?.smoke_level ?? 0,
    smokePpm: latestReading?.smoke_ppm ?? 0,
    smokeStatus: latestReading?.smoke_status ?? "SAFE",
    
    // Fire sensor
    fireDetected: latestReading?.fire_detected ?? false,
    fireIntensity: latestReading?.fire_intensity ?? 0,
    fireLevel: latestReading?.fire_level ?? "SAFE",
    
    // Movement (MPU6050)
    accelX: latestReading?.accel_x ?? 0,
    accelY: latestReading?.accel_y ?? 0,
    accelZ: latestReading?.accel_z ?? 0,
    accelMagnitude: latestReading?.accel_magnitude ?? 1,
    pitch: latestReading?.pitch ?? 0,
    roll: latestReading?.roll ?? 0,
    movementStatus: latestReading?.movement_status ?? "NORMAL",
    
    // Overall
    dangerLevel: latestReading?.danger_level ?? "SAFE",
    lastUpdated: latestReading?.created_at ?? null,
  };

  // Temperature history for sparkline (last 30 readings)
  const temperatureHistory = readings.map((r) => r.temperature).reverse();
  
  // Smoke level history
  const smokeLevelHistory = readings.map((r) => r.smoke_level).reverse();

  return {
    latestReading,
    readings,
    sensorStatus,
    temperatureHistory,
    smokeLevelHistory,
    isConnected,
    error,
    refetch: fetchLatest,
  };
};
