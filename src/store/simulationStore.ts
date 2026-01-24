import { create } from "zustand";
import {
  WorkerTelemetry,
  Incident,
  LogEntry,
  initializeWorkers,
  calculateNextHexCell,
  generateRandomIncident,
  generateZoneBreachIncident,
  generateNarrativeMessage,
  formatTimestamp,
  isInRestrictedZone,
  simulateBiometricDrift,
} from "@/utils/simEngine";

interface SimulationState {
  // Workers
  workers: WorkerTelemetry[];
  setWorkers: (workers: WorkerTelemetry[]) => void;
  updateWorker: (id: string, updates: Partial<WorkerTelemetry>) => void;
  moveWorkersToNextHex: () => void;

  // Incidents
  incidents: Incident[];
  activeIncident: Incident | null;
  addIncident: (incident: Incident) => void;
  resolveIncident: (id: string) => void;
  setActiveIncident: (incident: Incident | null) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, "id">) => void;
  clearLogs: () => void;
  streamNarrativeLog: () => void;

  // Focus state
  focusedWorkerId: string | null;
  setFocusedWorkerId: (id: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  isWarping: boolean;
  setIsWarping: (warping: boolean) => void;
  recenterMap: () => void;

  // Camera tracking (for live feed)
  trackedWorkerId: string | null;
  setTrackedWorkerId: (id: string | null) => void;

  // Glitch effect
  isGlitching: boolean;
  triggerGlitch: () => void;

  // Zone breach flash
  violationFlash: boolean;
  triggerViolationFlash: () => void;

  // Simulation controls
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  simulationTick: () => void;
  biometricTick: () => void;
  hrHistoryCounter: number; // Counter for HR history updates

  // Worker visibility
  showWorkers: boolean;
  toggleWorkersVisibility: () => void;

  // PPE highlight
  highlightedPPEType: string | null;
  setHighlightedPPEType: (type: string | null) => void;

  // Manual incident trigger
  triggerManualIncident: (workerId: string, type: string) => void;

  // Scroll to latest alert
  scrollToLatestAlert: () => void;
  alertScrollTrigger: number;

  // Sonar pulse trigger
  sonarPulseActive: boolean;
  triggerSonarPulse: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Workers
  workers: initializeWorkers(),
  setWorkers: (workers) => set({ workers }),
  updateWorker: (id, updates) =>
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === id ? { ...w, ...updates, lastUpdate: Date.now() } : w
      ),
    })),

  // Move all workers to their next hex cell (called every 4 seconds)
  moveWorkersToNextHex: () => {
    const state = get();
    if (!state.isRunning) return;

    const updatedWorkers = state.workers.map((worker) => {
      const newTarget = calculateNextHexCell(worker.position);
      const restrictedCheck = isInRestrictedZone(newTarget.x, newTarget.y);
      const wasInRestricted = worker.inRestrictedZone;

      // If entering restricted zone for the first time, trigger incident
      if (restrictedCheck.inZone && !wasInRestricted) {
        const incident = generateZoneBreachIncident(worker, restrictedCheck.zoneName!);
        
        // Queue incident creation (can't call addIncident directly in map)
        setTimeout(() => {
          get().addIncident(incident);
          get().addLog({
            timestamp: formatTimestamp(),
            type: "alert",
            message: incident.aiAnalysis,
            workerId: worker.id,
            priority: 80,
            incident,
          });
          get().triggerViolationFlash();
        }, 0);
      }

      return {
        ...worker,
        targetPosition: newTarget,
        inRestrictedZone: restrictedCheck.inZone,
        status: restrictedCheck.inZone ? "warning" as const : worker.status,
        lastUpdate: Date.now(),
      };
    });

    set({ workers: updatedWorkers });
  },

  // Incidents
  incidents: [],
  activeIncident: null,
  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents].slice(0, 50),
    })),
  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === id ? { ...i, resolved: true } : i
      ),
    })),
  setActiveIncident: (incident) => set({ activeIncident: incident }),

  // Logs
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        { ...log, id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` },
        ...state.logs,
      ]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 20),
    })),
  clearLogs: () => set({ logs: [] }),

  // Stream narrative log (called every 15 seconds)
  streamNarrativeLog: () => {
    const state = get();
    if (!state.isRunning) return;

    const message = generateNarrativeMessage(state.workers);
    const isDetection = message.startsWith("DET:");

    state.addLog({
      timestamp: formatTimestamp(),
      type: isDetection ? "detection" : "info",
      message,
      priority: 10,
    });
  },

  // Focus state
  focusedWorkerId: null,
  setFocusedWorkerId: (id) => set({ focusedWorkerId: id, trackedWorkerId: id }),
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  isWarping: false,
  setIsWarping: (warping) => set({ isWarping: warping }),
  recenterMap: () => {
    set({ 
      focusedWorkerId: null, 
      activeIncident: null, 
      trackedWorkerId: null,
      zoomLevel: 1,
      isWarping: false,
      highlightedPPEType: null,
    });
  },

  // Camera tracking
  trackedWorkerId: null,
  setTrackedWorkerId: (id) => set({ trackedWorkerId: id }),

  // Glitch effect
  isGlitching: false,
  triggerGlitch: () => {
    set({ isGlitching: true });
    setTimeout(() => set({ isGlitching: false }), 500);
  },

  // Violation flash
  violationFlash: false,
  triggerViolationFlash: () => {
    set({ violationFlash: true });
    setTimeout(() => set({ violationFlash: false }), 800);
  },

  // Simulation controls
  isRunning: true,
  setIsRunning: (running) => set({ isRunning: running }),

  // Worker visibility
  showWorkers: true,
  toggleWorkersVisibility: () => set((state) => ({ showWorkers: !state.showWorkers })),

  // PPE highlight
  highlightedPPEType: null,
  setHighlightedPPEType: (type) => set((state) => ({ 
    highlightedPPEType: state.highlightedPPEType === type ? null : type 
  })),

  // Manual incident trigger
  triggerManualIncident: (workerId, type) => {
    const state = get();
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    const incident: Incident = {
      id: `incident-${Date.now()}`,
      workerId,
      workerName: worker.name,
      type: type as any,
      severity: "critical",
      timestamp: Date.now(),
      position: { ...worker.position },
      resolved: false,
      aiAnalysis: type === "fall" 
        ? `CRITICAL: AI Analysis detected sudden vertical acceleration change for ${workerId}. High probability of slip-and-fall incident. GPS coordinates locked at [${worker.position.x.toFixed(1)}, ${worker.position.y.toFixed(1)}]. Emergency response required.`
        : `ALERT: Manual override triggered for ${workerId}. Incident type: ${type.toUpperCase()}. Location: ${worker.zone}.`,
    };

    state.addIncident(incident);
    state.addLog({
      timestamp: formatTimestamp(),
      type: "critical",
      message: incident.aiAnalysis,
      workerId,
      priority: 100,
      incident,
    });
    state.triggerGlitch();
    state.triggerViolationFlash();

    // Update worker status
    set((s) => ({
      workers: s.workers.map((w) =>
        w.id === workerId ? { ...w, status: "danger" as const } : w
      ),
    }));
  },

  // Scroll to latest alert
  alertScrollTrigger: 0,
  scrollToLatestAlert: () => set((state) => ({ alertScrollTrigger: state.alertScrollTrigger + 1 })),

  // Sonar pulse
  sonarPulseActive: false,
  triggerSonarPulse: () => {
    set({ sonarPulseActive: true });
    setTimeout(() => set({ sonarPulseActive: false }), 2000);
  },

  // HR history update counter (update every 10th biometric tick = ~2 seconds)
  hrHistoryCounter: 0,

  // Biometric tick (updates HR/O2 with drift, checks thresholds)
  biometricTick: () => {
    const state = get();
    if (!state.isRunning) return;

    const newCounter = (state.hrHistoryCounter + 1) % 10;
    const shouldUpdateHistory = newCounter === 0;

    const updatedWorkers = state.workers.map((worker) => {
      // Interpolate position towards target for smooth movement
      const lerpFactor = 0.15;
      const newPosition = {
        x: worker.position.x + (worker.targetPosition.x - worker.position.x) * lerpFactor,
        y: worker.position.y + (worker.targetPosition.y - worker.position.y) * lerpFactor,
      };

      // Biometric drift
      const { heartRate, oxygenLevel } = simulateBiometricDrift(
        worker.heartRate,
        worker.oxygenLevel,
        worker.inRestrictedZone
      );

      // Check HR threshold (> 100 BPM = elevated)
      const hrElevated = heartRate > 100;

      // Update HR history every ~2 seconds (keep last 30 readings = 60 seconds)
      const hrHistory = shouldUpdateHistory 
        ? [...worker.hrHistory.slice(1), heartRate]
        : worker.hrHistory;

      // Determine status
      let status: WorkerTelemetry["status"] = "safe";
      if (worker.inRestrictedZone) {
        status = "warning";
      } else if (heartRate > 110 || oxygenLevel < 93) {
        status = "warning";
      }
      if (heartRate > 125 || oxygenLevel < 90) {
        status = "danger";
      }

      return {
        ...worker,
        position: newPosition,
        heartRate,
        oxygenLevel,
        hrElevated,
        hrHistory,
        status,
        lastUpdate: Date.now(),
      };
    });

    set({ workers: updatedWorkers, hrHistoryCounter: newCounter });
  },

  simulationTick: () => {
    const state = get();
    if (!state.isRunning) return;

    // 10% chance of random incident per cycle
    if (Math.random() < 0.1) {
      const randomWorker =
        state.workers[Math.floor(Math.random() * state.workers.length)];
      const incident = generateRandomIncident(randomWorker);

      if (incident) {
        const newStatus =
          incident.severity === "critical"
            ? "danger"
            : incident.severity === "high"
            ? "warning"
            : randomWorker.status;

        set((s) => ({
          workers: s.workers.map((w) =>
            w.id === randomWorker.id
              ? { 
                  ...w, 
                  status: newStatus, 
                  ppe: incident.type === "ppe_violation" ? Math.max(40, w.ppe - 30) : w.ppe 
                }
              : w
          ),
        }));

        state.addIncident(incident);

        state.addLog({
          timestamp: formatTimestamp(),
          type:
            incident.severity === "critical"
              ? "critical"
              : incident.severity === "high"
              ? "alert"
              : "warning",
          message: incident.aiAnalysis,
          workerId: incident.workerId,
          priority:
            incident.severity === "critical"
              ? 100
              : incident.severity === "high"
              ? 75
              : 50,
          incident,
        });

        // Trigger glitch for critical incidents
        if (incident.severity === "critical") {
          state.triggerGlitch();
        }

        // Flash violations counter for any incident
        state.triggerViolationFlash();
      }
    }
  },
}));
