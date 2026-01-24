// Risk Detection Engine - Identifies workers at risk based on proximity and zone

import { WorkerTelemetry, RESTRICTED_ZONES } from "./simEngine";

export interface RiskAssessment {
  affectedWorkerIds: string[];
  hazardCenter: { x: number; y: number };
  hazardRadius: number;
  severity: "critical" | "high" | "medium";
  hazardType: string;
}

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Get workers within a certain radius of a point
 */
export const getWorkersInRadius = (
  workers: WorkerTelemetry[],
  center: { x: number; y: number },
  radius: number
): WorkerTelemetry[] => {
  return workers.filter(worker => {
    const distance = calculateDistance(worker.position, center);
    return distance <= radius;
  });
};

/**
 * Get workers in a specific zone by zone name
 */
export const getWorkersInZone = (
  workers: WorkerTelemetry[],
  zoneName: string
): WorkerTelemetry[] => {
  const zone = RESTRICTED_ZONES.find(z => z.name === zoneName);
  if (!zone) return [];
  
  return workers.filter(worker => {
    const distance = calculateDistance(worker.position, { x: zone.x, y: zone.y });
    return distance <= zone.radius;
  });
};

/**
 * Assess risk for an environmental hazard (gas leak, fire, etc.)
 * Returns all workers within the danger radius
 */
export const assessEnvironmentalRisk = (
  workers: WorkerTelemetry[],
  hazardCenter: { x: number; y: number },
  hazardRadius: number = 25, // Default danger radius of 25%
  hazardType: string = "GAS LEAK"
): RiskAssessment => {
  const affectedWorkers = getWorkersInRadius(workers, hazardCenter, hazardRadius);
  
  return {
    affectedWorkerIds: affectedWorkers.map(w => w.id),
    hazardCenter,
    hazardRadius,
    severity: affectedWorkers.length >= 3 ? "critical" : affectedWorkers.length >= 2 ? "high" : "medium",
    hazardType,
  };
};

/**
 * Calculate the bounding center and radius for a group of workers
 */
export const calculateDangerZone = (
  workers: WorkerTelemetry[],
  affectedWorkerIds: string[]
): { x: number; y: number; radius: number } => {
  const affectedWorkers = workers.filter(w => affectedWorkerIds.includes(w.id));
  
  if (affectedWorkers.length === 0) {
    return { x: 50, y: 50, radius: 10 };
  }
  
  if (affectedWorkers.length === 1) {
    return { 
      x: affectedWorkers[0].position.x, 
      y: affectedWorkers[0].position.y, 
      radius: 12 
    };
  }
  
  // Calculate center of mass
  const centerX = affectedWorkers.reduce((sum, w) => sum + w.position.x, 0) / affectedWorkers.length;
  const centerY = affectedWorkers.reduce((sum, w) => sum + w.position.y, 0) / affectedWorkers.length;
  
  // Calculate radius to encompass all workers (with 10% padding)
  const maxDistance = Math.max(
    ...affectedWorkers.map(w => calculateDistance(w.position, { x: centerX, y: centerY }))
  );
  
  return { 
    x: centerX, 
    y: centerY, 
    radius: maxDistance + 10 // Add padding
  };
};

/**
 * Generate a summary log message for multiple workers at risk
 */
export const generateMultiWorkerAlert = (
  affectedWorkerIds: string[],
  hazardType: string
): string => {
  if (affectedWorkerIds.length === 1) {
    return `🔴 CRITICAL: ${hazardType} detected. Worker ${affectedWorkerIds[0]} at immediate risk.`;
  }
  
  return `🔴 SITE-WIDE ALERT: ${hazardType} detected. MULTIPLE WORKERS AT RISK: ${affectedWorkerIds.join(", ")}. Immediate evacuation required.`;
};

/**
 * Calculate average biometrics for a group of workers
 */
export const calculateGroupBiometrics = (
  workers: WorkerTelemetry[],
  workerIds: string[]
): { avgHeartRate: number; avgOxygen: number; maxHR: number; minO2: number } => {
  const affectedWorkers = workers.filter(w => workerIds.includes(w.id));
  
  if (affectedWorkers.length === 0) {
    return { avgHeartRate: 0, avgOxygen: 0, maxHR: 0, minO2: 100 };
  }
  
  const avgHeartRate = Math.round(
    affectedWorkers.reduce((sum, w) => sum + w.heartRate, 0) / affectedWorkers.length
  );
  const avgOxygen = Math.round(
    affectedWorkers.reduce((sum, w) => sum + w.oxygenLevel, 0) / affectedWorkers.length * 10
  ) / 10;
  const maxHR = Math.max(...affectedWorkers.map(w => w.heartRate));
  const minO2 = Math.min(...affectedWorkers.map(w => w.oxygenLevel));
  
  return { avgHeartRate, avgOxygen, maxHR, minO2 };
};
