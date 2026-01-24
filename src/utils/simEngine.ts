// Simulation Engine Types and Logic
export interface WorkerTelemetry {
  id: string;
  name: string;
  status: "safe" | "warning" | "danger";
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  ppe: number;
  zone: string;
  lastUpdate: number;
  heartRate: number;
  oxygenLevel: number;
}

export interface Incident {
  id: string;
  workerId: string;
  workerName: string;
  type: "fall" | "restricted_zone" | "ppe_violation" | "proximity_alert" | "environmental";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  position: { x: number; y: number };
  aiAnalysis: string;
  resolved: boolean;
}

export type LogEntry = {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "alert" | "detection" | "critical";
  message: string;
  workerId?: string;
  priority: number;
  incident?: Incident;
};

const WORKER_NAMES = [
  "Chen, Marcus",
  "Rodriguez, Ana",
  "Kim, David",
  "Okonkwo, Emeka",
  "Petrov, Yuri",
];

const ZONES = ["Alpha-7", "Beta-3", "Gamma-1", "Delta-9", "Omega-2"];

const RESTRICTED_ZONES = [
  { x: 20, y: 20, radius: 15 },
  { x: 80, y: 75, radius: 12 },
];

// Generate AI analysis based on incident type
export const generateAIAnalysis = (
  incident: Omit<Incident, "aiAnalysis">
): string => {
  const { type, workerId, position } = incident;
  const coords = `[${position.x.toFixed(1)}, ${position.y.toFixed(1)}]`;

  switch (type) {
    case "fall":
      return `AI Analysis: Unusual vertical velocity change detected for Worker ${workerId}. High probability of slip-and-fall incident. Accelerometer spike: 9.2G. GPS coordinates locked at ${coords}. Emergency response protocol initiated.`;
    case "restricted_zone":
      return `AI Analysis: Unauthorized perimeter breach detected. Worker ${workerId} has entered restricted zone at ${coords}. Proximity sensors triggered. Calculating optimal evacuation route. Security alert dispatched.`;
    case "ppe_violation":
      return `AI Analysis: PPE compliance scan failed for Worker ${workerId}. Neural network confidence: 94.7%. Missing equipment detected via thermal imaging at ${coords}. Supervisor notification queued.`;
    case "proximity_alert":
      return `AI Analysis: Dangerous proximity detected. Worker ${workerId} within 2m of active machinery at ${coords}. Collision probability: 67%. Audio warning deployed to worker's helmet.`;
    case "environmental":
      return `AI Analysis: Environmental hazard detected near Worker ${workerId}. Gas sensor anomaly at ${coords}. H2S levels: 12ppm (threshold: 10ppm). Evacuation recommendation generated.`;
    default:
      return `AI Analysis: Anomaly detected for Worker ${workerId} at coordinates ${coords}. Pattern recognition in progress.`;
  }
};

// Check if position is in restricted zone
export const isInRestrictedZone = (x: number, y: number): boolean => {
  return RESTRICTED_ZONES.some((zone) => {
    const distance = Math.sqrt(
      Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2)
    );
    return distance < zone.radius;
  });
};

// Generate random movement
export const calculateNewPosition = (
  current: { x: number; y: number },
  velocity: { x: number; y: number }
): { position: { x: number; y: number }; velocity: { x: number; y: number } } => {
  // Add some randomness to velocity
  const newVelocity = {
    x: velocity.x + (Math.random() - 0.5) * 4,
    y: velocity.y + (Math.random() - 0.5) * 4,
  };

  // Clamp velocity
  newVelocity.x = Math.max(-3, Math.min(3, newVelocity.x));
  newVelocity.y = Math.max(-3, Math.min(3, newVelocity.y));

  // Calculate new position
  let newX = current.x + newVelocity.x;
  let newY = current.y + newVelocity.y;

  // Bounce off boundaries (keep within 15-85% of map)
  if (newX < 15 || newX > 85) {
    newVelocity.x *= -1;
    newX = Math.max(15, Math.min(85, newX));
  }
  if (newY < 15 || newY > 85) {
    newVelocity.y *= -1;
    newY = Math.max(15, Math.min(85, newY));
  }

  return {
    position: { x: newX, y: newY },
    velocity: newVelocity,
  };
};

// Generate random incident
export const generateRandomIncident = (
  worker: WorkerTelemetry
): Incident | null => {
  const incidentTypes: Incident["type"][] = [
    "fall",
    "restricted_zone",
    "ppe_violation",
    "proximity_alert",
    "environmental",
  ];

  const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

  // Determine severity based on type
  let severity: Incident["severity"];
  switch (type) {
    case "fall":
      severity = "critical";
      break;
    case "restricted_zone":
      severity = "high";
      break;
    case "ppe_violation":
      severity = Math.random() > 0.5 ? "medium" : "high";
      break;
    case "proximity_alert":
      severity = "high";
      break;
    case "environmental":
      severity = Math.random() > 0.3 ? "critical" : "high";
      break;
    default:
      severity = "medium";
  }

  const incident: Omit<Incident, "aiAnalysis"> = {
    id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    workerId: worker.id,
    workerName: worker.name,
    type,
    severity,
    timestamp: Date.now(),
    position: { ...worker.position },
    resolved: false,
  };

  return {
    ...incident,
    aiAnalysis: generateAIAnalysis(incident),
  };
};

// Initialize workers
export const initializeWorkers = (): WorkerTelemetry[] => {
  return WORKER_NAMES.map((name, index) => ({
    id: `W-${String(index + 1).padStart(3, "0")}`,
    name,
    status: "safe" as const,
    position: {
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 50,
    },
    velocity: {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    },
    ppe: 85 + Math.floor(Math.random() * 15),
    zone: ZONES[Math.floor(Math.random() * ZONES.length)],
    lastUpdate: Date.now(),
    heartRate: 70 + Math.floor(Math.random() * 20),
    oxygenLevel: 95 + Math.floor(Math.random() * 5),
  }));
};

// Format timestamp
export const formatTimestamp = (date: Date = new Date()): string => {
  return date.toLocaleTimeString("en-US", { hour12: false });
};

// Get severity color
export const getSeverityColor = (severity: Incident["severity"]): string => {
  switch (severity) {
    case "critical":
      return "text-danger";
    case "high":
      return "text-ember";
    case "medium":
      return "text-ember/70";
    case "low":
      return "text-cyan";
    default:
      return "text-muted-foreground";
  }
};

// Get severity prefix
export const getSeverityPrefix = (severity: Incident["severity"]): string => {
  switch (severity) {
    case "critical":
      return "[CRITICAL]";
    case "high":
      return "[HIGH]";
    case "medium":
      return "[MEDIUM]";
    case "low":
      return "[LOW]";
    default:
      return "[INFO]";
  }
};
