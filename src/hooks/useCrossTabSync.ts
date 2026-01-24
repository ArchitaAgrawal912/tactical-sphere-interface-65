import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * Hook to sync Zustand state across browser tabs via localStorage events.
 * When Site Centre triggers an incident, Dashboard immediately updates.
 */
export const useCrossTabSync = () => {
  const {
    addIncident,
    addLog,
    updateWorker,
    triggerGlitch,
    triggerViolationFlash,
    workers,
  } = useSimulationStore();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return;

      try {
        // Handle cross-tab incident trigger
        if (event.key === "cross-tab-incident") {
          const data = JSON.parse(event.newValue);
          
          // Add the incident to store
          addIncident(data.incident);
          
          // Add log entry
          addLog(data.log);
          
          // Update worker status if specified
          if (data.workerUpdate) {
            updateWorker(data.workerUpdate.id, data.workerUpdate.updates);
          }
          
          // Trigger visual effects
          if (data.triggerGlitch) {
            triggerGlitch();
          }
          if (data.triggerViolationFlash) {
            triggerViolationFlash();
          }
          
          console.log("[CROSS-TAB] Incident received:", data.incident.type);
        }
        
        // Handle cross-tab broadcast message
        if (event.key === "cross-tab-broadcast") {
          const data = JSON.parse(event.newValue);
          addLog(data);
          console.log("[CROSS-TAB] Broadcast received:", data.message);
        }
        
        // Handle cross-tab worker update
        if (event.key === "cross-tab-worker-update") {
          const data = JSON.parse(event.newValue);
          updateWorker(data.id, data.updates);
          console.log("[CROSS-TAB] Worker updated:", data.id);
        }
        
      } catch (error) {
        console.error("[CROSS-TAB] Error parsing storage event:", error);
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [addIncident, addLog, updateWorker, triggerGlitch, triggerViolationFlash, workers]);
};

/**
 * Utility to broadcast an incident to other tabs
 */
export const broadcastIncident = (payload: {
  incident: any;
  log: any;
  workerUpdate?: { id: string; updates: any };
  triggerGlitch?: boolean;
  triggerViolationFlash?: boolean;
}) => {
  localStorage.setItem("cross-tab-incident", JSON.stringify({
    ...payload,
    _timestamp: Date.now(), // Force storage event even for same data
  }));
};

/**
 * Utility to broadcast a message to other tabs
 */
export const broadcastMessage = (log: any) => {
  localStorage.setItem("cross-tab-broadcast", JSON.stringify({
    ...log,
    _timestamp: Date.now(),
  }));
};

/**
 * Utility to broadcast a worker update to other tabs
 */
export const broadcastWorkerUpdate = (id: string, updates: any) => {
  localStorage.setItem("cross-tab-worker-update", JSON.stringify({
    id,
    updates,
    _timestamp: Date.now(),
  }));
};
