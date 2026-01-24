// Safety Protocol Engine - Maps incident types to specific response actions

import { Incident } from "./simEngine";

export interface ProtocolStep {
  id: string;
  action: string;
  description: string;
  priority: "immediate" | "high" | "medium";
  automated?: boolean; // If true, shows as auto-completed
  requiresConfirmation?: boolean;
}

export interface ResponseProtocol {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium";
  color: "danger" | "ember" | "cyan";
  steps: ProtocolStep[];
  actions: ProtocolAction[];
}

export interface ProtocolAction {
  id: string;
  label: string;
  icon: "siren" | "medic" | "halt" | "evacuate" | "lock";
  type: "primary" | "secondary" | "danger";
  automatedAction?: string; // Description of what this triggers
}

export interface ActiveProtocol {
  protocolId: string;
  incidentId: string;
  workerId: string;
  startedAt: number;
  completedSteps: string[];
  verificationStatus: "pending" | "verified" | "false_alarm";
  resolvedAt?: number;
}

// Protocol definitions for each incident type
export const SAFETY_PROTOCOLS: Record<Incident["type"], ResponseProtocol> = {
  fall: {
    id: "proto-fall",
    name: "FALL DETECTION RESPONSE",
    severity: "critical",
    color: "danger",
    steps: [
      {
        id: "fall-1",
        action: "Trigger Site-Wide Alarm",
        description: "Activate emergency beacon and audio alarm in affected sector",
        priority: "immediate",
        automated: true,
      },
      {
        id: "fall-2",
        action: "Auto-dispatch Medical Team",
        description: "Medical response team notified with GPS coordinates",
        priority: "immediate",
        automated: true,
      },
      {
        id: "fall-3",
        action: "Lock CAM Feed on Worker",
        description: "Visual verification feed locked for incident documentation",
        priority: "immediate",
        automated: true,
      },
      {
        id: "fall-4",
        action: "Halt Nearby Machinery",
        description: "All equipment within 10m radius emergency stopped",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "fall-5",
        action: "Clear Evacuation Path",
        description: "Ensure access route for emergency responders",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "fall-6",
        action: "Notify Site Manager",
        description: "Escalation to on-site safety coordinator",
        priority: "medium",
        requiresConfirmation: true,
      },
    ],
    actions: [
      { id: "act-medic", label: "Dispatch Medics", icon: "medic", type: "danger", automatedAction: "EMS Alert Sent" },
      { id: "act-siren", label: "Activate Siren", icon: "siren", type: "primary", automatedAction: "Sector Alarm Active" },
      { id: "act-evac", label: "Clear Area", icon: "evacuate", type: "secondary", automatedAction: "Evacuation Order Issued" },
    ],
  },

  restricted_zone: {
    id: "proto-geofence",
    name: "GEOFENCE BREACH PROTOCOL",
    severity: "high",
    color: "ember",
    steps: [
      {
        id: "geo-1",
        action: "Activate Haptic Alert",
        description: "Vibration warning sent to worker's mobile device",
        priority: "immediate",
        automated: true,
      },
      {
        id: "geo-2",
        action: "Issue Audio Warning",
        description: "Directional speaker activated in worker's zone",
        priority: "immediate",
        automated: true,
      },
      {
        id: "geo-3",
        action: "Halt Nearby Machinery",
        description: "Equipment in restricted zone powered down",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "geo-4",
        action: "Calculate Safe Route",
        description: "Optimal exit path transmitted to worker's device",
        priority: "high",
        automated: true,
      },
      {
        id: "geo-5",
        action: "Notify On-site Supervisor",
        description: "Zone supervisor alerted for intervention",
        priority: "medium",
        requiresConfirmation: true,
      },
      {
        id: "geo-6",
        action: "Log Incident for Review",
        description: "Record breach for safety audit and training",
        priority: "medium",
        requiresConfirmation: true,
      },
    ],
    actions: [
      { id: "act-halt", label: "Halt Machinery", icon: "halt", type: "danger", automatedAction: "Equipment Stopped" },
      { id: "act-siren", label: "Zone Alarm", icon: "siren", type: "primary", automatedAction: "Alarm Activated" },
      { id: "act-lock", label: "Lock Zone", icon: "lock", type: "secondary", automatedAction: "Access Restricted" },
    ],
  },

  ppe_violation: {
    id: "proto-ppe",
    name: "PPE VIOLATION RESPONSE",
    severity: "medium",
    color: "ember",
    steps: [
      {
        id: "ppe-1",
        action: "Issue Audio Warning",
        description: "Voice alert broadcast to worker's zone",
        priority: "immediate",
        automated: true,
      },
      {
        id: "ppe-2",
        action: "Send Mobile Notification",
        description: "Push notification with violation details",
        priority: "immediate",
        automated: true,
      },
      {
        id: "ppe-3",
        action: "Notify On-site Supervisor",
        description: "Supervisor alerted for equipment check",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "ppe-4",
        action: "Log Incident for Review",
        description: "Record violation for safety training records",
        priority: "medium",
        requiresConfirmation: true,
      },
      {
        id: "ppe-5",
        action: "Update Compliance Score",
        description: "Worker's PPE compliance metrics updated",
        priority: "medium",
        automated: true,
      },
    ],
    actions: [
      { id: "act-siren", label: "Zone Warning", icon: "siren", type: "primary", automatedAction: "Warning Issued" },
      { id: "act-lock", label: "Restrict Access", icon: "lock", type: "secondary", automatedAction: "Access Limited" },
    ],
  },

  proximity_alert: {
    id: "proto-proximity",
    name: "PROXIMITY HAZARD RESPONSE",
    severity: "high",
    color: "ember",
    steps: [
      {
        id: "prox-1",
        action: "Activate Collision Warning",
        description: "Audio alert to worker's helmet speaker",
        priority: "immediate",
        automated: true,
      },
      {
        id: "prox-2",
        action: "Slow Nearby Equipment",
        description: "Machinery speed reduced to safe levels",
        priority: "immediate",
        automated: true,
      },
      {
        id: "prox-3",
        action: "Emergency Stop if Threshold",
        description: "Full halt if distance < 1.5m",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "prox-4",
        action: "Notify Equipment Operator",
        description: "Machine operator alerted to worker presence",
        priority: "high",
        automated: true,
      },
      {
        id: "prox-5",
        action: "Log Near-Miss Event",
        description: "Record for safety analysis and prevention",
        priority: "medium",
        requiresConfirmation: true,
      },
    ],
    actions: [
      { id: "act-halt", label: "Emergency Stop", icon: "halt", type: "danger", automatedAction: "All Stop Engaged" },
      { id: "act-siren", label: "Proximity Alarm", icon: "siren", type: "primary", automatedAction: "Alarm Active" },
    ],
  },

  environmental: {
    id: "proto-env",
    name: "ENVIRONMENTAL HAZARD RESPONSE",
    severity: "critical",
    color: "danger",
    steps: [
      {
        id: "env-1",
        action: "Trigger Evacuation Alert",
        description: "Site-wide evacuation order for affected sectors",
        priority: "immediate",
        automated: true,
      },
      {
        id: "env-2",
        action: "Activate Ventilation Systems",
        description: "Emergency air handling engaged",
        priority: "immediate",
        automated: true,
      },
      {
        id: "env-3",
        action: "Dispatch HazMat Team",
        description: "Specialized response team notified",
        priority: "immediate",
        automated: true,
      },
      {
        id: "env-4",
        action: "Seal Affected Zone",
        description: "Lock down contaminated area",
        priority: "high",
        requiresConfirmation: true,
      },
      {
        id: "env-5",
        action: "Monitor Air Quality",
        description: "Continuous sensor feed to control room",
        priority: "high",
        automated: true,
      },
      {
        id: "env-6",
        action: "Account for All Personnel",
        description: "Head count and muster point verification",
        priority: "high",
        requiresConfirmation: true,
      },
    ],
    actions: [
      { id: "act-evac", label: "Evacuate Zone", icon: "evacuate", type: "danger", automatedAction: "Evacuation Order" },
      { id: "act-siren", label: "Site Alarm", icon: "siren", type: "primary", automatedAction: "Full Site Alert" },
      { id: "act-lock", label: "Seal Zone", icon: "lock", type: "secondary", automatedAction: "Zone Locked" },
    ],
  },
};

// Get protocol for an incident type
export const getProtocolForIncident = (incident: Incident): ResponseProtocol => {
  return SAFETY_PROTOCOLS[incident.type];
};

// Get initial active protocol state
export const createActiveProtocol = (incident: Incident): ActiveProtocol => {
  const protocol = getProtocolForIncident(incident);
  // Auto-complete automated steps
  const autoCompleted = protocol.steps
    .filter(s => s.automated)
    .map(s => s.id);

  return {
    protocolId: protocol.id,
    incidentId: incident.id,
    workerId: incident.workerId,
    startedAt: Date.now(),
    completedSteps: autoCompleted,
    verificationStatus: "pending",
  };
};

// Check if all required steps are completed
export const isProtocolComplete = (protocol: ResponseProtocol, activeProtocol: ActiveProtocol): boolean => {
  const requiredSteps = protocol.steps.filter(s => s.requiresConfirmation);
  return requiredSteps.every(s => activeProtocol.completedSteps.includes(s.id));
};

// Get completion percentage
export const getProtocolProgress = (protocol: ResponseProtocol, activeProtocol: ActiveProtocol): number => {
  const total = protocol.steps.length;
  const completed = activeProtocol.completedSteps.length;
  return Math.round((completed / total) * 100);
};
