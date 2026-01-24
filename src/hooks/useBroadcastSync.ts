import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { subscribe, broadcast, BroadcastPayload } from "@/utils/broadcastChannel";

/**
 * Hook to receive cross-tab broadcasts and sync state.
 * Used in Dashboard to listen for Site Centre triggers.
 * Handles both individual incidents and site-wide emergencies.
 */
export const useBroadcastSync = () => {
  const {
    addIncident,
    addLog,
    updateWorker,
    triggerGlitch,
    triggerViolationFlash,
    activateProtocol,
    activateSiteWideProtocol,
    setFocusedWorkerId,
    setTrackedWorkerId,
    setIsWarping,
    setZoomLevel,
    updateSyncTimestamp,
    setCriticalWorkerIds,
    workers,
    setWorkers,
    setActiveDangerZone,
  } = useSimulationStore();

  // Send heartbeat every 3 seconds to confirm connection
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start heartbeat
    heartbeatRef.current = setInterval(() => {
      broadcast("SYNC_HEARTBEAT", { timestamp: Date.now() }, "dashboard");
    }, 3000);

    const handleMessage = (message: BroadcastPayload) => {
      // Ignore messages from same source (dashboard)
      if (message.source === "dashboard") return;

      // Update sync timestamp for any received message
      updateSyncTimestamp();

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

        case "SITE_STATE_SYNC": {
          // Full state sync - update all workers at once
          const { workers: syncedWorkers, timestamp } = message.payload;
          
          if (syncedWorkers && Array.isArray(syncedWorkers)) {
            // Merge synced worker states (preserve local data, update status/position)
            const currentWorkers = useSimulationStore.getState().workers;
            const mergedWorkers = currentWorkers.map(localWorker => {
              const syncedWorker = syncedWorkers.find((sw: any) => sw.id === localWorker.id);
              if (syncedWorker) {
                return {
                  ...localWorker,
                  status: syncedWorker.status || localWorker.status,
                  inRestrictedZone: syncedWorker.inRestrictedZone ?? localWorker.inRestrictedZone,
                };
              }
              return localWorker;
            });
            setWorkers(mergedWorkers);
          }
          break;
        }

        case "MASS_EMERGENCY": {
          // Site-wide emergency affecting multiple workers
          const { 
            incident, 
            affectedWorkerIds, 
            workerUpdates, 
            logs,
            dangerZone,
            effects 
          } = message.payload;
          
          // Update all affected workers at once
          if (workerUpdates && Array.isArray(workerUpdates)) {
            workerUpdates.forEach((update: { id: string; updates: any }) => {
              updateWorker(update.id, update.updates);
            });
          }
          
          // Add all log entries
          if (logs && Array.isArray(logs)) {
            logs.forEach((log: any) => {
              addLog(log);
            });
          }
          
          // Add the main incident
          if (incident) {
            addIncident(incident);
          }
          
          // Trigger visual effects - more intense for mass emergency
          if (effects?.glitch) {
            triggerGlitch();
            // Double glitch for emphasis
            setTimeout(() => triggerGlitch(), 300);
          }
          if (effects?.violationFlash) {
            triggerViolationFlash();
          }
          
          // SITE-WIDE PROTOCOL: Zoom out and show all affected workers
          if (incident && affectedWorkerIds && affectedWorkerIds.length > 1) {
            // Set critical worker IDs for camera cycling
            setCriticalWorkerIds(affectedWorkerIds);
            
            // Set danger zone for visualization on map
            if (dangerZone) {
              setActiveDangerZone(dangerZone);
            }
            
            // Zoom out to show entire affected sector
            setZoomLevel(0.6);
            setFocusedWorkerId(null);
            setIsWarping(true);
            
            setTimeout(() => setIsWarping(false), 800);
            
            // Activate site-wide emergency protocol
            setTimeout(() => {
              activateSiteWideProtocol(incident, affectedWorkerIds);
            }, 300);
          } else if (incident) {
            // Single worker mass event - treat as critical incident
            setFocusedWorkerId(incident.workerId);
            setTrackedWorkerId(incident.workerId);
            setIsWarping(true);
            setZoomLevel(1.25);
            
            setTimeout(() => setIsWarping(false), 800);
            setTimeout(() => activateProtocol(incident), 300);
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

        case "SYNC_HEARTBEAT": {
          // Site Centre is alive - respond with PONG
          broadcast("PONG", { timestamp: Date.now() }, "dashboard");
          break;
        }
        
        case "PING": {
          // Respond to ping with pong for connection status
          broadcast("PONG", { timestamp: Date.now() }, "dashboard");
          break;
        }
      }
    };

    // Subscribe to broadcast messages
    const unsubscribe = subscribe(handleMessage);
    
    return () => {
      unsubscribe();
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [
    addIncident,
    addLog,
    updateWorker,
    triggerGlitch,
    triggerViolationFlash,
    activateProtocol,
    activateSiteWideProtocol,
    setFocusedWorkerId,
    setTrackedWorkerId,
    setIsWarping,
    setZoomLevel,
    updateSyncTimestamp,
    setCriticalWorkerIds,
    workers,
    setWorkers,
    setActiveDangerZone,
  ]);
};
