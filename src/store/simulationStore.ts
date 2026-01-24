import { create } from "zustand";
import {
  WorkerTelemetry,
  Incident,
  LogEntry,
  initializeWorkers,
  calculateNewPosition,
  generateRandomIncident,
  formatTimestamp,
  isInRestrictedZone,
} from "@/utils/simEngine";

interface SimulationState {
  // Workers
  workers: WorkerTelemetry[];
  setWorkers: (workers: WorkerTelemetry[]) => void;
  updateWorker: (id: string, updates: Partial<WorkerTelemetry>) => void;

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

  // Focus state
  focusedWorkerId: string | null;
  setFocusedWorkerId: (id: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  isWarping: boolean;
  setIsWarping: (warping: boolean) => void;

  // Glitch effect
  isGlitching: boolean;
  triggerGlitch: () => void;

  // Simulation controls
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  simulationTick: () => void;
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

  // Focus state
  focusedWorkerId: null,
  setFocusedWorkerId: (id) => set({ focusedWorkerId: id }),
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  isWarping: false,
  setIsWarping: (warping) => set({ isWarping: warping }),

  // Glitch effect
  isGlitching: false,
  triggerGlitch: () => {
    set({ isGlitching: true });
    setTimeout(() => set({ isGlitching: false }), 500);
  },

  // Simulation controls
  isRunning: true,
  setIsRunning: (running) => set({ isRunning: running }),

  simulationTick: () => {
    const state = get();
    if (!state.isRunning) return;

    const updatedWorkers = state.workers.map((worker) => {
      const { position, velocity } = calculateNewPosition(
        worker.position,
        worker.velocity
      );

      // Check if in restricted zone
      const inRestricted = isInRestrictedZone(position.x, position.y);

      // Random vital fluctuations
      const heartRate = Math.max(
        60,
        Math.min(120, worker.heartRate + (Math.random() - 0.5) * 5)
      );
      const oxygenLevel = Math.max(
        90,
        Math.min(100, worker.oxygenLevel + (Math.random() - 0.5) * 2)
      );

      // Determine status
      let status: WorkerTelemetry["status"] = "safe";
      if (inRestricted || heartRate > 110 || oxygenLevel < 93) {
        status = "warning";
      }

      return {
        ...worker,
        position,
        velocity,
        status,
        heartRate: Math.round(heartRate),
        oxygenLevel: Math.round(oxygenLevel * 10) / 10,
        lastUpdate: Date.now(),
      };
    });

    set({ workers: updatedWorkers });

    // 10% chance of incident per cycle
    if (Math.random() < 0.1) {
      const randomWorker =
        updatedWorkers[Math.floor(Math.random() * updatedWorkers.length)];
      const incident = generateRandomIncident(randomWorker);

      if (incident) {
        // Update worker status based on incident
        const newStatus =
          incident.severity === "critical"
            ? "danger"
            : incident.severity === "high"
            ? "warning"
            : randomWorker.status;

        set((s) => ({
          workers: s.workers.map((w) =>
            w.id === randomWorker.id
              ? { ...w, status: newStatus, ppe: incident.type === "ppe_violation" ? Math.max(40, w.ppe - 30) : w.ppe }
              : w
          ),
        }));

        state.addIncident(incident);

        // Add log entry
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
      }
    }

    // Add random informational logs
    if (Math.random() < 0.3) {
      const randomWorker =
        updatedWorkers[Math.floor(Math.random() * updatedWorkers.length)];
      const infoMessages = [
        `Worker ${randomWorker.id} biometrics nominal. HR: ${randomWorker.heartRate}bpm, O2: ${randomWorker.oxygenLevel}%`,
        `Zone ${randomWorker.zone} scan complete. ${updatedWorkers.filter((w) => w.zone === randomWorker.zone).length} workers detected.`,
        `PPE compliance check passed for ${randomWorker.id}. All equipment verified.`,
        `Perimeter sensors active. No unauthorized access detected.`,
        `AI model calibration complete. Detection accuracy: ${(97 + Math.random() * 2).toFixed(1)}%`,
      ];

      state.addLog({
        timestamp: formatTimestamp(),
        type: Math.random() > 0.5 ? "detection" : "info",
        message: infoMessages[Math.floor(Math.random() * infoMessages.length)],
        priority: 10,
      });
    }
  },
}));
