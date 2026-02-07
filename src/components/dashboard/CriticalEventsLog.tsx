import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Flame, Wind, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CriticalEvent {
  id: string;
  timestamp: Date;
  type: "FIRE" | "SMOKE" | "MOTION" | "GENERAL";
  level: string;
  message: string;
  details?: string;
}

interface CriticalEventsLogProps {
  dangerLevel: string;
  fireDetected: boolean;
  fireLevel: string;
  fireIntensity: number;
  smokeStatus: string;
  smokeLevel: number;
  movementStatus: string;
  accelMagnitude?: number;
}

const MAX_EVENTS = 20;

const getEventIcon = (type: CriticalEvent["type"]) => {
  switch (type) {
    case "FIRE": return Flame;
    case "SMOKE": return Wind;
    case "MOTION": return Activity;
    default: return AlertTriangle;
  }
};

const getEventColor = (level: string) => {
  if (level === "CRITICAL") return "border-destructive/50 bg-destructive/5";
  if (level === "WARNING" || level === "HIGH") return "border-amber/50 bg-amber/5";
  return "border-primary/50 bg-primary/5";
};

const CriticalEventsLog = ({
  dangerLevel,
  fireDetected,
  fireLevel,
  fireIntensity,
  smokeStatus,
  smokeLevel,
  movementStatus,
  accelMagnitude,
}: CriticalEventsLogProps) => {
  const [events, setEvents] = useState<CriticalEvent[]>([]);
  const [lastStates, setLastStates] = useState({
    fireDetected: false,
    fireLevel: "SAFE",
    smokeStatus: "SAFE",
    movementStatus: "NORMAL",
  });

  const addEvent = useCallback((event: Omit<CriticalEvent, "id" | "timestamp">) => {
    setEvents((prev) => {
      const newEvent: CriticalEvent = {
        ...event,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
      };
      return [newEvent, ...prev].slice(0, MAX_EVENTS);
    });
  }, []);

  // Watch for critical state changes and log them
  useEffect(() => {
    // Fire detection
    if (fireDetected && !lastStates.fireDetected) {
      addEvent({
        type: "FIRE",
        level: "CRITICAL",
        message: "🔥 FIRE DETECTED!",
        details: `Intensity: ${fireIntensity.toFixed(1)}%`,
      });
    } else if (fireLevel === "CRITICAL" && lastStates.fireLevel !== "CRITICAL") {
      addEvent({
        type: "FIRE",
        level: "CRITICAL",
        message: "Fire level CRITICAL",
        details: `Intensity: ${fireIntensity.toFixed(1)}%`,
      });
    } else if (fireLevel === "HIGH" && lastStates.fireLevel !== "HIGH" && lastStates.fireLevel !== "CRITICAL") {
      addEvent({
        type: "FIRE",
        level: "WARNING",
        message: "Fire level elevated",
        details: `Intensity: ${fireIntensity.toFixed(1)}%`,
      });
    }

    // Smoke detection
    if (smokeStatus === "CRITICAL" && lastStates.smokeStatus !== "CRITICAL") {
      addEvent({
        type: "SMOKE",
        level: "CRITICAL",
        message: "💨 SMOKE CRITICAL!",
        details: `Level: ${smokeLevel.toFixed(1)}% above baseline`,
      });
    } else if (smokeStatus === "HIGH" && lastStates.smokeStatus !== "HIGH" && lastStates.smokeStatus !== "CRITICAL") {
      addEvent({
        type: "SMOKE",
        level: "WARNING",
        message: "Smoke level elevated",
        details: `Level: ${smokeLevel.toFixed(1)}% above baseline`,
      });
    }

    // Movement detection
    if (movementStatus === "IMPACT DETECTED" && lastStates.movementStatus !== "IMPACT DETECTED") {
      addEvent({
        type: "MOTION",
        level: "CRITICAL",
        message: "⚡ IMPACT DETECTED!",
        details: accelMagnitude ? `Magnitude: ${accelMagnitude.toFixed(2)}g` : undefined,
      });
    } else if (movementStatus === "FREEFALL/TILT" && lastStates.movementStatus !== "FREEFALL/TILT") {
      addEvent({
        type: "MOTION",
        level: "WARNING",
        message: "Freefall or tilt detected",
        details: accelMagnitude ? `Magnitude: ${accelMagnitude.toFixed(2)}g` : undefined,
      });
    } else if (movementStatus === "HEAVY MOVEMENT" && lastStates.movementStatus === "NORMAL") {
      addEvent({
        type: "MOTION",
        level: "WARNING",
        message: "Heavy movement detected",
        details: accelMagnitude ? `Magnitude: ${accelMagnitude.toFixed(2)}g` : undefined,
      });
    }

    // Update last states
    setLastStates({
      fireDetected,
      fireLevel,
      smokeStatus,
      movementStatus,
    });
  }, [fireDetected, fireLevel, fireIntensity, smokeStatus, smokeLevel, movementStatus, accelMagnitude, lastStates, addEvent]);

  const clearEvents = () => setEvents([]);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(
            "w-4 h-4",
            events.length > 0 ? "text-destructive" : "text-muted-foreground"
          )} />
          <span className="text-sm font-medium text-foreground">Critical Events</span>
          {events.length > 0 && (
            <span className="px-1.5 py-0.5 bg-destructive/20 text-destructive text-[10px] font-mono rounded">
              {events.length}
            </span>
          )}
        </div>
        {events.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearEvents}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Subtitle */}
      <div className="px-4 py-2 bg-muted/30">
        <p className="text-[10px] text-muted-foreground">
          Only logs dangerous readings (CRITICAL, IMPACT, FIRE)
        </p>
      </div>

      {/* Events List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {events.map((event, idx) => {
              const Icon = getEventIcon(event.type);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn(
                    "p-3 rounded-lg border",
                    getEventColor(event.level)
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      event.level === "CRITICAL" ? "text-destructive" : "text-amber"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-xs font-medium",
                          event.level === "CRITICAL" ? "text-destructive" : "text-foreground"
                        )}>
                          {event.message}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      {event.details && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {event.details}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No critical events</p>
              <p className="text-[10px] mt-1">All systems nominal</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CriticalEventsLog;
