// Simulation Engine Types and Logic
export interface WorkerTelemetry {
  id: string;
  name: string;
  status: "safe" | "warning" | "danger";
  position: { x: number; y: number };
  targetPosition: { x: number; y: number }; // For smooth hex transitions
  velocity: { x: number; y: number };
  ppe: number;
  zone: string;
  lastUpdate: number;
  heartRate: number;
  oxygenLevel: number;
  inRestrictedZone: boolean;
  hrElevated: boolean; // For amber ring pulse
  hrHistory: number[]; // Last 60 seconds of HR readings (sampled every 2s = 30 points)
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

// Geofence definitions - Sector North and Restricted zones
export const RESTRICTED_ZONES = [
  { id: "sector-north", x: 20, y: 20, radius: 15, name: "Sector North" },
  { id: "restricted-1", x: 80, y: 75, radius: 12, name: "Restricted Area" },
];

// Generate AI analysis based on incident type
export const generateAIAnalysis = (
  incident: Omit<Incident, "aiAnalysis">
): string => {
  const { type, workerId, position } = incident;
  const coords = `[${position.x.toFixed(1)}, ${position.y.toFixed(1)}]`;
  const zone = getZoneAtPosition(position.x, position.y);

  switch (type) {
    case "fall":
      return `AI Analysis: Unusual vertical velocity change detected for Worker ${workerId}. High probability of slip-and-fall incident. Accelerometer spike: 9.2G. GPS coordinates locked at ${coords}. Emergency response protocol initiated.`;
    case "restricted_zone":
      return `AI Analysis: Unauthorized perimeter breach detected at ${zone}. Worker ${workerId} has crossed geofence boundary at ${coords}. Proximity sensors triggered. Calculating optimal evacuation route. Security alert dispatched.`;
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

// Get zone name at position
export const getZoneAtPosition = (x: number, y: number): string => {
  const zone = RESTRICTED_ZONES.find((z) => {
    const distance = Math.sqrt(Math.pow(x - z.x, 2) + Math.pow(y - z.y, 2));
    return distance < z.radius;
  });
  return zone?.name || "Safe Zone";
};

// Check if position is in restricted zone - returns zone info
export const isInRestrictedZone = (x: number, y: number): { inZone: boolean; zoneName: string | null } => {
  const zone = RESTRICTED_ZONES.find((z) => {
    const distance = Math.sqrt(Math.pow(x - z.x, 2) + Math.pow(y - z.y, 2));
    return distance < z.radius;
  });
  return { inZone: !!zone, zoneName: zone?.name || null };
};

// Calculate adjacent hex cell (smoother transitions)
export const calculateNextHexCell = (
  current: { x: number; y: number }
): { x: number; y: number } => {
  // Hex-like movement - 6 directions
  const directions = [
    { x: 5, y: 0 },    // Right
    { x: -5, y: 0 },   // Left
    { x: 2.5, y: 4.3 },  // Down-right
    { x: -2.5, y: 4.3 }, // Down-left
    { x: 2.5, y: -4.3 }, // Up-right
    { x: -2.5, y: -4.3 }, // Up-left
  ];

  const dir = directions[Math.floor(Math.random() * directions.length)];
  let newX = current.x + dir.x;
  let newY = current.y + dir.y;

  // Bounce off boundaries (keep within 12-88% of map)
  if (newX < 12) newX = 12 + Math.abs(dir.x);
  if (newX > 88) newX = 88 - Math.abs(dir.x);
  if (newY < 12) newY = 12 + Math.abs(dir.y);
  if (newY > 88) newY = 88 - Math.abs(dir.y);

  return { x: newX, y: newY };
};

// Generate random movement (legacy - used for velocity)
export const calculateNewPosition = (
  current: { x: number; y: number },
  velocity: { x: number; y: number }
): { position: { x: number; y: number }; velocity: { x: number; y: number } } => {
  const newVelocity = {
    x: velocity.x + (Math.random() - 0.5) * 4,
    y: velocity.y + (Math.random() - 0.5) * 4,
  };

  newVelocity.x = Math.max(-3, Math.min(3, newVelocity.x));
  newVelocity.y = Math.max(-3, Math.min(3, newVelocity.y));

  let newX = current.x + newVelocity.x;
  let newY = current.y + newVelocity.y;

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

// Simulate biometric drift
export const simulateBiometricDrift = (
  currentHR: number,
  currentO2: number,
  isInDanger: boolean
): { heartRate: number; oxygenLevel: number } => {
  // More aggressive drift when in danger zone
  const hrDrift = isInDanger ? (Math.random() - 0.3) * 8 : (Math.random() - 0.5) * 4;
  const o2Drift = isInDanger ? (Math.random() - 0.6) * 2 : (Math.random() - 0.5) * 1;

  const heartRate = Math.max(58, Math.min(135, currentHR + hrDrift));
  const oxygenLevel = Math.max(88, Math.min(100, currentO2 + o2Drift));

  return {
    heartRate: Math.round(heartRate),
    oxygenLevel: Math.round(oxygenLevel * 10) / 10,
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

// Generate zone breach incident specifically
export const generateZoneBreachIncident = (
  worker: WorkerTelemetry,
  zoneName: string
): Incident => {
  const incident: Omit<Incident, "aiAnalysis"> = {
    id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    workerId: worker.id,
    workerName: worker.name,
    type: "restricted_zone",
    severity: "high",
    timestamp: Date.now(),
    position: { ...worker.position },
    resolved: false,
  };

  return {
    ...incident,
    aiAnalysis: `ALR: Unauthorized perimeter breach detected at ${zoneName}. Worker ${worker.id} has crossed geofence boundary at [${worker.position.x.toFixed(1)}, ${worker.position.y.toFixed(1)}]. Security protocol engaged. Evacuation route calculated.`,
  };
};

// Initialize workers with new properties
export const initializeWorkers = (): WorkerTelemetry[] => {
  return WORKER_NAMES.map((name, index) => {
    const position = {
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 50,
    };
    const initialHR = 70 + Math.floor(Math.random() * 20);
    // Initialize HR history with baseline readings
    const hrHistory = Array.from({ length: 30 }, () => 
      initialHR + Math.floor((Math.random() - 0.5) * 10)
    );
    return {
      id: `W-${String(index + 1).padStart(3, "0")}`,
      name,
      status: "safe" as const,
      position,
      targetPosition: position,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
      ppe: 85 + Math.floor(Math.random() * 15),
      zone: ZONES[Math.floor(Math.random() * ZONES.length)],
      lastUpdate: Date.now(),
      heartRate: initialHR,
      oxygenLevel: 95 + Math.floor(Math.random() * 5),
      inRestrictedZone: false,
      hrElevated: false,
      hrHistory,
    };
  });
};

// Format timestamp
export const formatTimestamp = (date: Date = new Date()): string => {
  return date.toLocaleTimeString("en-US", { hour12: false });
};

// Streaming AI narrative messages
export const AI_NARRATIVE_MESSAGES = [
  "INF: AI model calibration complete. Detection accuracy: {accuracy}%.",
  "DET: Worker {workerId} biometrics nominal. HR: {hr}bpm, O2: {o2}%.",
  "INF: Perimeter sensors active. All sectors secure.",
  "DET: Zone {zone} thermal scan complete. {count} workers detected.",
  "INF: PPE compliance check passed for {workerId}. All equipment verified.",
  "DET: Environmental sensors nominal. Air quality index: {aqi}.",
  "INF: Neural network update complete. Model version: v2.{version}.",
  "DET: Movement pattern analysis for {workerId}: Normal locomotion.",
  "INF: Geofence boundaries active. {zones} restricted zones monitored.",
  "DET: Heartbeat variability for {workerId} within safe parameters.",
];

// Generate a narrative message
export const generateNarrativeMessage = (workers: WorkerTelemetry[]): string => {
  const template = AI_NARRATIVE_MESSAGES[Math.floor(Math.random() * AI_NARRATIVE_MESSAGES.length)];
  const randomWorker = workers[Math.floor(Math.random() * workers.length)];
  
  return template
    .replace("{accuracy}", (97 + Math.random() * 2).toFixed(1))
    .replace("{workerId}", randomWorker.id)
    .replace("{hr}", String(randomWorker.heartRate))
    .replace("{o2}", String(randomWorker.oxygenLevel))
    .replace("{zone}", randomWorker.zone)
    .replace("{count}", String(Math.floor(Math.random() * 3) + 1))
    .replace("{aqi}", String(Math.floor(Math.random() * 30) + 70))
    .replace("{version}", String(Math.floor(Math.random() * 100)))
    .replace("{zones}", String(RESTRICTED_ZONES.length));
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
