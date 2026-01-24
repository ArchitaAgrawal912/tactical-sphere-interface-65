import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { subscribe, BroadcastPayload } from "@/utils/broadcastChannel";

/**
 * Hook to receive cross-tab broadcasts and sync state.
 * Used in Dashboard to listen for Site Centre triggers.
 */
export const useBroadcastSync = () => {
  const {
    addIncident,
    addLog,
    updateWorker,
    triggerGlitch,
    triggerViolationFlash,
    activateProtocol,
    setFocusedWorkerId,
    setTrackedWorkerId,
    setIsWarping,
    setZoomLevel,
  } = useSimulationStore();

  useEffect(() => {
    const handleMessage = (message: BroadcastPayload) => {
      // Ignore messages from same source (dashboard)
      if (message.source === "dashboard") return;

      switch (message.type) {
        case "NEW_INCIDENT": {
          const { incident, log, workerUpdate, effects } = message.payload;
          
          // Add incident to store
          if (incident) {
            addIncident(incident);
          }
          
          // Add log entry
          if (log) {
            addLog(log);
          }
          
          // Update worker status
          if (workerUpdate) {
            updateWorker(workerUpdate.id, workerUpdate.updates);
          }
          
          // Trigger visual effects
          if (effects?.glitch) {
            triggerGlitch();
          }
          if (effects?.violationFlash) {
            triggerViolationFlash();
          }
          
          // AUTO-POPUP: For critical incidents, activate protocol immediately
          if (incident && (incident.severity === "critical" || incident.severity === "high")) {
            // Camera warp to the affected worker
            if (incident.workerId) {
              setFocusedWorkerId(incident.workerId);
              setTrackedWorkerId(incident.workerId);
              setIsWarping(true);
              setZoomLevel(1.25);
              
              setTimeout(() => setIsWarping(false), 800);
              setTimeout(() => setZoomLevel(1), 8000);
            }
            
            // Auto-activate response protocol for critical incidents
            if (incident.severity === "critical") {
              setTimeout(() => {
                activateProtocol(incident);
              }, 300); // Small delay for visual effect
            }
          }
          break;
        }
        
        case "WORKER_UPDATE": {
          const { id, updates } = message.payload;
          updateWorker(id, updates);
          break;
        }
        
        case "BROADCAST_MESSAGE": {
          addLog(message.payload);
          break;
        }
        
        case "TRIGGER_EFFECT": {
          const { glitch, violationFlash } = message.payload;
          if (glitch) triggerGlitch();
          if (violationFlash) triggerViolationFlash();
          break;
        }
        
        case "PROTOCOL_ACTIVATE": {
          const { incident } = message.payload;
          if (incident) {
            activateProtocol(incident);
            if (incident.workerId) {
              setFocusedWorkerId(incident.workerId);
              setTrackedWorkerId(incident.workerId);
            }
          }
          break;
        }
        
        case "PING": {
          // Respond to ping with pong for connection status
          // Site Centre will receive this to confirm link is active
          break;
        }
      }
    };

    // Subscribe to broadcast messages
    const unsubscribe = subscribe(handleMessage);
    
    return () => {
      unsubscribe();
    };
  }, [
    addIncident,
    addLog,
    updateWorker,
    triggerGlitch,
    triggerViolationFlash,
    activateProtocol,
    setFocusedWorkerId,
    setTrackedWorkerId,
    setIsWarping,
    setZoomLevel,
  ]);
};
