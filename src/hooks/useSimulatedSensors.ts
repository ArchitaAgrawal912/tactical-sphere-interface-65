import { useState, useEffect, useCallback } from "react";

export interface SimulatedSensorData {
  smokeLevel: number;
  smokePpm: number;
  smokeStatus: string;
  fireDetected: boolean;
  fireIntensity: number;
  fireLevel: string;
  accelX: number;
  accelY: number;
  accelZ: number;
  accelMagnitude: number;
  pitch: number;
  roll: number;
  movementStatus: string;
  dangerLevel: string;
  lastUpdated: string;
}

// Helper to clamp value within range
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// Helper to drift a value smoothly
const drift = (current: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() - 0.5) * 2 * maxDelta;
  return clamp(current + delta, min, max);
};

// Determine status from level
const getSmokeStatus = (level: number): string => {
  if (level > 80) return "CRITICAL";
  if (level > 60) return "HIGH";
  if (level > 40) return "MEDIUM";
  if (level > 20) return "LOW";
  return "SAFE";
};

const getFireLevel = (intensity: number, detected: boolean): string => {
  if (detected || intensity > 70) return "CRITICAL";
  if (intensity > 50) return "HIGH";
  if (intensity > 30) return "MEDIUM";
  if (intensity > 10) return "LOW";
  return "SAFE";
};

const getMovementStatus = (magnitude: number, prevMagnitude: number): string => {
  const delta = Math.abs(magnitude - prevMagnitude);
  if (delta > 0.2) return "IMPACT DETECTED";
  if (magnitude > 1.5) return "HEAVY MOVEMENT";
  if (magnitude < 0.8) return "FREEFALL/TILT";
  return "NORMAL";
};

const getDangerLevel = (fireLevel: string, smokeStatus: string, movementStatus: string): string => {
  if (fireLevel === "CRITICAL" || smokeStatus === "CRITICAL") return "CRITICAL";
  if (fireLevel === "HIGH" || smokeStatus === "HIGH" || movementStatus === "IMPACT DETECTED") return "WARNING";
  if (smokeStatus === "MEDIUM" || smokeStatus === "LOW") return "CAUTION";
  return "SAFE";
};

export const useSimulatedSensors = (enabled: boolean = true, interval: number = 2000) => {
  const [data, setData] = useState<SimulatedSensorData>({
    smokeLevel: 5,
    smokePpm: 50,
    smokeStatus: "SAFE",
    fireDetected: false,
    fireIntensity: 3,
    fireLevel: "SAFE",
    accelX: 0.02,
    accelY: -0.01,
    accelZ: 1.0,
    accelMagnitude: 1.0,
    pitch: 2,
    roll: -1,
    movementStatus: "NORMAL",
    dangerLevel: "SAFE",
    lastUpdated: new Date().toISOString(),
  });

  const [prevMagnitude, setPrevMagnitude] = useState(1.0);

  // Generate a random incident occasionally (5% chance per tick)
  const maybeInjectIncident = useCallback((current: SimulatedSensorData): Partial<SimulatedSensorData> => {
    const random = Math.random();
    
    // 2% chance of fire spike
    if (random < 0.02) {
      return { fireIntensity: 75 + Math.random() * 20, fireDetected: true };
    }
    // 3% chance of smoke spike
    if (random < 0.05) {
      return { smokeLevel: 60 + Math.random() * 30 };
    }
    // 2% chance of impact
    if (random < 0.07) {
      return { accelMagnitude: 1.8 + Math.random() * 0.5 };
    }
    
    return {};
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setData((prev) => {
        // Inject occasional incidents
        const incident = maybeInjectIncident(prev);

        // Drift values smoothly
        let smokeLevel = incident.smokeLevel ?? drift(prev.smokeLevel, 0, 100, 2);
        let fireIntensity = incident.fireIntensity ?? drift(prev.fireIntensity, 0, 100, 1);
        const fireDetected = incident.fireDetected ?? fireIntensity > 20;
        
        // Decay incident spikes back to normal
        if (smokeLevel > 30 && !incident.smokeLevel) {
          smokeLevel = smokeLevel * 0.95;
        }
        if (fireIntensity > 15 && !incident.fireIntensity) {
          fireIntensity = fireIntensity * 0.92;
        }

        const accelX = drift(prev.accelX, -0.2, 0.2, 0.02);
        const accelY = drift(prev.accelY, -0.2, 0.2, 0.02);
        const accelZ = drift(prev.accelZ, 0.9, 1.1, 0.02);
        let accelMagnitude = incident.accelMagnitude ?? Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
        
        // Decay magnitude back to normal
        if (accelMagnitude > 1.3 && !incident.accelMagnitude) {
          accelMagnitude = accelMagnitude * 0.9 + 1.0 * 0.1;
        }

        const pitch = drift(prev.pitch, -10, 10, 0.5);
        const roll = drift(prev.roll, -10, 10, 0.5);

        const smokeStatus = getSmokeStatus(smokeLevel);
        const fireLevel = getFireLevel(fireIntensity, fireDetected);
        const movementStatus = getMovementStatus(accelMagnitude, prevMagnitude);
        const dangerLevel = getDangerLevel(fireLevel, smokeStatus, movementStatus);

        setPrevMagnitude(accelMagnitude);

        return {
          smokeLevel,
          smokePpm: smokeLevel * 10 + Math.random() * 50,
          smokeStatus,
          fireDetected,
          fireIntensity,
          fireLevel,
          accelX,
          accelY,
          accelZ,
          accelMagnitude,
          pitch,
          roll,
          movementStatus,
          dangerLevel,
          lastUpdated: new Date().toISOString(),
        };
      });
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, maybeInjectIncident, prevMagnitude]);

  return data;
};
