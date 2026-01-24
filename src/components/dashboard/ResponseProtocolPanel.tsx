import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Circle, 
  Siren, 
  Ambulance, 
  OctagonX, 
  LogOut, 
  Lock,
  AlertTriangle,
  CheckCheck,
  X,
  Bot,
  Sparkles
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { 
  getProtocolForIncident,
  getSiteWideProtocol, 
  isProtocolComplete, 
  getProtocolProgress,
  ProtocolAction 
} from "@/utils/safetyProtocols";

const ActionIcon = ({ icon }: { icon: ProtocolAction["icon"] }) => {
  switch (icon) {
    case "siren": return <Siren className="w-4 h-4" />;
    case "medic": return <Ambulance className="w-4 h-4" />;
    case "halt": return <OctagonX className="w-4 h-4" />;
    case "evacuate": return <LogOut className="w-4 h-4" />;
    case "lock": return <Lock className="w-4 h-4" />;
  }
};

const ResponseProtocolPanel = () => {
  const { 
    activeIncident,
    activeProtocol,
    toggleProtocolStep,
    executeProtocolAction,
    resolveActiveIncident,
    dismissProtocol,
    executedActions,
    isSiteWideEmergency,
    affectedWorkerIds,
  } = useSimulationStore();

  // Use site-wide protocol if it's a mass emergency
  const protocol = isSiteWideEmergency 
    ? getSiteWideProtocol() 
    : activeIncident ? getProtocolForIncident(activeIncident) : null;

  // Early return if no incident or protocol
  if (!activeIncident || !activeProtocol || !protocol) {
    return null;
  }

  const progress = getProtocolProgress(protocol, activeProtocol);
  const canResolve = isProtocolComplete(protocol, activeProtocol) && 
                     activeProtocol.verificationStatus === "verified";

  const getSeverityGlow = () => {
    switch (protocol.color) {
      case "danger": return "shadow-[0_0_30px_rgba(255,0,0,0.3)]";
      case "ember": return "shadow-[0_0_30px_rgba(255,191,0,0.3)]";
      default: return "shadow-[0_0_30px_rgba(0,242,255,0.3)]";
    }
  };

  const getSeverityBorder = () => {
    switch (protocol.color) {
      case "danger": return "border-danger/50";
      case "ember": return "border-ember/50";
      default: return "border-cyan/50";
    }
  };

  const getSeverityText = () => {
    switch (protocol.color) {
      case "danger": return "text-danger";
      case "ember": return "text-ember";
      default: return "text-cyan";
    }
  };

  const getSeverityBg = () => {
    switch (protocol.color) {
      case "danger": return "bg-danger/10";
      case "ember": return "bg-ember/10";
      default: return "bg-cyan/10";
    }
  };

  return (
    <motion.div
      className={`glass-panel p-3 w-full ${getSeverityGlow()} ${getSeverityBorder()} border-2`}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        boxShadow: protocol.color === "danger" 
          ? ["0 0 20px rgba(255,0,0,0.2)", "0 0 40px rgba(255,0,0,0.4)", "0 0 20px rgba(255,0,0,0.2)"]
          : ["0 0 20px rgba(255,191,0,0.2)", "0 0 40px rgba(255,191,0,0.4)", "0 0 20px rgba(255,191,0,0.2)"]
      }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        boxShadow: { duration: 2, repeat: Infinity }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <ShieldAlert className={`w-4 h-4 ${getSeverityText()}`} />
          </motion.div>
          <span className={`text-xs font-mono font-bold tracking-widest uppercase ${getSeverityText()}`}>
            Response Protocol
          </span>
        </div>
        <button
          onClick={dismissProtocol}
          className="p-1 hover:bg-muted/20 rounded transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* AI Verification Badge */}
      <motion.div
        className="flex items-center gap-2 px-2 py-1.5 mb-3 rounded bg-cyan/10 border border-cyan/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-3 h-3 text-cyan" />
        </motion.div>
        <span className="text-[9px] font-mono text-cyan font-bold tracking-widest uppercase">
          Verified by AI
        </span>
        <Bot className="w-3 h-3 text-cyan ml-auto" />
      </motion.div>

      {/* Protocol Name */}
      <motion.div
        className={`px-2 py-1.5 rounded ${getSeverityBg()} border ${getSeverityBorder()} mb-3`}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <p className={`text-[10px] font-mono font-bold tracking-wider uppercase ${getSeverityText()}`}>
          {protocol.name}
        </p>
        {isSiteWideEmergency ? (
          <div className="mt-1">
            <p className="text-[9px] font-mono text-danger font-bold">
              ⚠️ {affectedWorkerIds.length} WORKERS AT RISK
            </p>
            <p className="text-[8px] font-mono text-muted-foreground mt-0.5">
              {affectedWorkerIds.join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
            Worker: {activeIncident.workerId} | {activeIncident.workerName}
          </p>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-muted-foreground">PROGRESS</span>
          <span className={`text-[10px] font-mono font-bold ${getSeverityText()}`}>{progress}%</span>
        </div>
        <div className="h-1.5 bg-obsidian-light rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              protocol.color === "danger" 
                ? "bg-gradient-to-r from-danger to-danger-glow" 
                : "bg-gradient-to-r from-ember to-ember-glow"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Verification Status */}
      <div className={`px-2 py-1.5 rounded border mb-3 ${
        activeProtocol.verificationStatus === "verified" 
          ? "bg-cyan/10 border-cyan/30"
          : activeProtocol.verificationStatus === "false_alarm"
            ? "bg-muted/10 border-muted/30"
            : "bg-ember/10 border-ember/30"
      }`}>
        <div className="flex items-center gap-2">
          {activeProtocol.verificationStatus === "verified" ? (
            <CheckCircle2 className="w-3 h-3 text-cyan" />
          ) : activeProtocol.verificationStatus === "false_alarm" ? (
            <X className="w-3 h-3 text-muted-foreground" />
          ) : (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="w-3 h-3 text-ember" />
            </motion.div>
          )}
          <span className={`text-[9px] font-mono font-bold ${
            activeProtocol.verificationStatus === "verified" 
              ? "text-cyan"
              : activeProtocol.verificationStatus === "false_alarm"
                ? "text-muted-foreground"
                : "text-ember"
          }`}>
            {activeProtocol.verificationStatus === "verified" 
              ? "INCIDENT VERIFIED" 
              : activeProtocol.verificationStatus === "false_alarm"
                ? "MARKED AS FALSE ALARM"
                : "PENDING VERIFICATION"}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan/20">
        {protocol.steps.map((step, index) => {
          const isCompleted = activeProtocol.completedSteps.includes(step.id);
          const isAutomated = step.automated;
          
          return (
            <motion.button
              key={step.id}
              onClick={() => !isAutomated && toggleProtocolStep(step.id)}
              disabled={isAutomated}
              className={`w-full flex items-start gap-2 p-1.5 rounded text-left transition-all ${
                isCompleted 
                  ? "bg-cyan/10 border border-cyan/20" 
                  : "bg-obsidian/50 border border-transparent hover:border-cyan/20"
              } ${isAutomated ? "cursor-default" : "cursor-pointer"}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-cyan" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[9px] font-mono leading-tight ${
                  isCompleted ? "text-cyan" : "text-foreground"
                }`}>
                  {step.action}
                  {isAutomated && (
                    <span className="ml-1 text-[8px] text-muted-foreground">[AUTO]</span>
                  )}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <p className="text-[9px] font-mono text-muted-foreground">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-2">
          {protocol.actions.map((action) => {
            const isExecuted = executedActions.includes(action.id);
            
            return (
              <motion.button
                key={action.id}
                onClick={() => !isExecuted && executeProtocolAction(action.id)}
                disabled={isExecuted}
                className={`hud-button flex items-center justify-center gap-1.5 px-2 py-2 rounded border text-[9px] font-mono font-bold transition-all active:scale-95 ${
                  isExecuted
                    ? "bg-cyan/20 border-cyan/50 text-cyan cursor-default"
                    : action.type === "danger"
                      ? "bg-danger/10 border-danger/30 text-danger hover:bg-danger/20 hover:border-danger hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                      : action.type === "primary"
                        ? "bg-ember/10 border-ember/30 text-ember hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]"
                        : "bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]"
                }`}
                whileHover={!isExecuted ? { scale: 1.02 } : {}}
                whileTap={!isExecuted ? { scale: 0.95 } : {}}
              >
                {isExecuted ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <ActionIcon icon={action.icon} />
                )}
                <span className="truncate">{isExecuted ? "DONE" : action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Resolve Button */}
      <AnimatePresence>
        {canResolve && (
          <motion.button
            onClick={resolveActiveIncident}
            className="w-full hud-button flex items-center justify-center gap-2 px-4 py-3 rounded border-2 border-cyan bg-cyan/20 text-cyan font-mono font-bold text-sm hover:bg-cyan/30 hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all active:scale-95"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle2 className="w-4 h-4" />
            RESOLVE INCIDENT
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status message when not resolvable */}
      {!canResolve && (
        <div className="text-center">
          <p className="text-[9px] font-mono text-muted-foreground">
            {activeProtocol.verificationStatus !== "verified" 
              ? "Verify incident in Live Feed to enable resolution"
              : "Complete all checklist items to resolve"}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ResponseProtocolPanel;
