import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulationStore";

interface UseWorkerSimOptions {
  movementInterval?: number; // 4 seconds for hex movement
  biometricInterval?: number; // 200ms for smooth position interpolation
  narrativeInterval?: number; // 15 seconds for AI narrative
  incidentInterval?: number; // 10 seconds for random incidents
  autoStart?: boolean;
}

export const useWorkerSim = (options: UseWorkerSimOptions = {}) => {
  const {
    movementInterval = 4000,
    biometricInterval = 200,
    narrativeInterval = 15000,
    incidentInterval = 10000,
    autoStart = true,
  } = options;

  const movementRef = useRef<NodeJS.Timeout | null>(null);
  const biometricRef = useRef<NodeJS.Timeout | null>(null);
  const narrativeRef = useRef<NodeJS.Timeout | null>(null);
  const incidentRef = useRef<NodeJS.Timeout | null>(null);

  const {
    workers,
    incidents,
    logs,
    isRunning,
    setIsRunning,
    moveWorkersToNextHex,
    biometricTick,
    streamNarrativeLog,
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
    trackedWorkerId,
    setTrackedWorkerId,
    violationFlash,
  } = useSimulationStore();

  // Start/stop simulation
  useEffect(() => {
    if (autoStart) {
      setIsRunning(true);
    }
  }, [autoStart, setIsRunning]);

  // Movement tick loop (every 4 seconds)
  useEffect(() => {
    if (isRunning) {
      moveWorkersToNextHex();
      movementRef.current = setInterval(() => {
        moveWorkersToNextHex();
      }, movementInterval);
    }

    return () => {
      if (movementRef.current) {
        clearInterval(movementRef.current);
      }
    };
  }, [isRunning, movementInterval, moveWorkersToNextHex]);

  // Biometric tick loop (every 200ms for smooth interpolation)
  useEffect(() => {
    if (isRunning) {
      biometricRef.current = setInterval(() => {
        biometricTick();
      }, biometricInterval);
    }

    return () => {
      if (biometricRef.current) {
        clearInterval(biometricRef.current);
      }
    };
  }, [isRunning, biometricInterval, biometricTick]);

  // Narrative log stream (every 15 seconds)
  useEffect(() => {
    if (isRunning) {
      streamNarrativeLog();
      narrativeRef.current = setInterval(() => {
        streamNarrativeLog();
      }, narrativeInterval);
    }

    return () => {
      if (narrativeRef.current) {
        clearInterval(narrativeRef.current);
      }
    };
  }, [isRunning, narrativeInterval, streamNarrativeLog]);

  // Random incident tick (every 10 seconds)
  useEffect(() => {
    if (isRunning) {
      incidentRef.current = setInterval(() => {
        simulationTick();
      }, incidentInterval);
    }

    return () => {
      if (incidentRef.current) {
        clearInterval(incidentRef.current);
      }
    };
  }, [isRunning, incidentInterval, simulationTick]);

  // Focus on worker (hyperspace warp)
  const focusOnWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    // Start warp animation
    setIsWarping(true);
    setZoomLevel(1.8);
    setFocusedWorkerId(workerId);
    setTrackedWorkerId(workerId);

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
    setTrackedWorkerId(null);
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
    trackedWorkerId,
    violationFlash,
  };
};
