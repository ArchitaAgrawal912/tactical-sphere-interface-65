import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulationStore";

interface UseWorkerSimOptions {
  tickInterval?: number;
  autoStart?: boolean;
}

export const useWorkerSim = (options: UseWorkerSimOptions = {}) => {
  const { tickInterval = 10000, autoStart = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    workers,
    incidents,
    logs,
    isRunning,
    setIsRunning,
    simulationTick,
    focusedWorkerId,
    setFocusedWorkerId,
    activeIncident,
    setActiveIncident,
    isGlitching,
    isWarping,
    setIsWarping,
    zoomLevel,
    setZoomLevel,
  } = useSimulationStore();

  // Start/stop simulation
  useEffect(() => {
    if (autoStart) {
      setIsRunning(true);
    }
  }, [autoStart, setIsRunning]);

  // Simulation tick loop
  useEffect(() => {
    if (isRunning) {
      // Initial tick
      simulationTick();

      // Set up interval
      intervalRef.current = setInterval(() => {
        simulationTick();
      }, tickInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tickInterval, simulationTick]);

  // Focus on worker (hyperspace warp)
  const focusOnWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    // Start warp animation
    setIsWarping(true);
    setZoomLevel(2);
    setFocusedWorkerId(workerId);

    // End warp after animation
    setTimeout(() => {
      setIsWarping(false);
    }, 800);

    // Reset zoom after delay
    setTimeout(() => {
      setZoomLevel(1);
    }, 5000);
  };

  // Handle incident click
  const handleIncidentClick = (incident: typeof incidents[0]) => {
    setActiveIncident(incident);
    focusOnWorker(incident.workerId);
  };

  // Clear focus
  const clearFocus = () => {
    setFocusedWorkerId(null);
    setActiveIncident(null);
    setZoomLevel(1);
  };

  return {
    workers,
    incidents,
    logs,
    isRunning,
    setIsRunning,
    focusedWorkerId,
    activeIncident,
    focusOnWorker,
    handleIncidentClick,
    clearFocus,
    isGlitching,
    isWarping,
    zoomLevel,
  };
};
