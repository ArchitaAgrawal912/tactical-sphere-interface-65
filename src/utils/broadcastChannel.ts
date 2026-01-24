/**
 * "Ironclad" Cross-Tab Communication Bridge
 * 
 * Uses DUAL-CHANNEL approach for bulletproof reliability:
 * 1. BroadcastChannel API - Modern, instant, but not supported in all contexts
 * 2. localStorage + manual event dispatch - Universal fallback
 * 
 * When transmitting: Writes to BOTH channels simultaneously
 * When receiving: Listens to BOTH channels and deduplicates
 */

const CHANNEL_NAME = "guardian_vision_sync";
const STORAGE_KEY = "guardian_latest_incident";

// Message types for type safety
export type BroadcastMessageType = 
  | "NEW_INCIDENT"
  | "WORKER_UPDATE"
  | "BROADCAST_MESSAGE"
  | "TRIGGER_EFFECT"
  | "PROTOCOL_ACTIVATE"
  | "CLEAR_ALL"
  | "PING"
  | "PONG"
  | "SITE_STATE_SYNC"      // Full site state packet
  | "MASS_EMERGENCY"        // Site-wide emergency with multiple workers
  | "SYNC_HEARTBEAT";       // Connection health check

export interface BroadcastPayload {
  type: BroadcastMessageType;
  payload: any;
  timestamp: number;
  source: "site-centre" | "dashboard";
  id: string; // Unique ID for deduplication
}

// Singleton channel instance
let channel: BroadcastChannel | null = null;

// Track processed message IDs to avoid duplicates
const processedMessageIds = new Set<string>();

/**
 * Get or create the BroadcastChannel instance
 */
export const getChannel = (): BroadcastChannel => {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    console.log("[BROADCAST] Channel initialized:", CHANNEL_NAME);
  }
  return channel;
};

/**
 * Generate unique message ID
 */
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * IRONCLAD TRANSMITTER
 * Sends message via BOTH BroadcastChannel AND localStorage
 */
export const broadcast = (
  type: BroadcastMessageType, 
  payload: any, 
  source: "site-centre" | "dashboard" = "site-centre"
) => {
  const messageId = generateMessageId();
  const message: BroadcastPayload = {
    type,
    payload,
    timestamp: Date.now(),
    source,
    id: messageId,
  };
  
  // CHANNEL 1: BroadcastChannel API (instant, modern)
  try {
    getChannel().postMessage(message);
    console.log(`[BROADCAST:BC] Sent ${type}:`, payload);
  } catch (error) {
    console.warn("[BROADCAST:BC] Failed to send via BroadcastChannel:", error);
  }
  
  // CHANNEL 2: localStorage + manual event dispatch (universal fallback)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    // Manually dispatch storage event for same-origin tabs
    window.dispatchEvent(new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue: JSON.stringify(message),
      storageArea: localStorage,
    }));
    console.log(`[BROADCAST:LS] Sent ${type} via localStorage`);
  } catch (error) {
    console.warn("[BROADCAST:LS] Failed to send via localStorage:", error);
  }
};

/**
 * IRONCLAD RECEIVER
 * Subscribes to BOTH channels and deduplicates messages
 */
export const subscribe = (callback: (message: BroadcastPayload) => void): (() => void) => {
  
  // Deduplicated handler
  const processMessage = (message: BroadcastPayload) => {
    // Skip if we've already processed this message
    if (processedMessageIds.has(message.id)) {
      console.log(`[BROADCAST] Duplicate message ignored: ${message.id}`);
      return;
    }
    
    // Mark as processed (limit set size to prevent memory bloat)
    processedMessageIds.add(message.id);
    if (processedMessageIds.size > 100) {
      const iterator = processedMessageIds.values();
      processedMessageIds.delete(iterator.next().value);
    }
    
    console.log(`[BROADCAST] Processing ${message.type} from ${message.source}`);
    callback(message);
  };
  
  // LISTENER 1: BroadcastChannel API
  const ch = getChannel();
  const bcHandler = (event: MessageEvent<BroadcastPayload>) => {
    console.log(`[BROADCAST:BC] Received ${event.data.type}`);
    processMessage(event.data);
  };
  ch.onmessage = bcHandler;
  
  // LISTENER 2: localStorage storage events
  const storageHandler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    
    try {
      const message: BroadcastPayload = JSON.parse(event.newValue);
      console.log(`[BROADCAST:LS] Received ${message.type}`);
      processMessage(message);
    } catch (error) {
      console.error("[BROADCAST:LS] Failed to parse storage event:", error);
    }
  };
  window.addEventListener("storage", storageHandler);
  
  // Return cleanup function
  return () => {
    ch.onmessage = null;
    window.removeEventListener("storage", storageHandler);
    console.log("[BROADCAST] Unsubscribed from all channels");
  };
};

/**
 * Close the channel (call on unmount if needed)
 */
export const closeChannel = () => {
  if (channel) {
    channel.close();
    channel = null;
    console.log("[BROADCAST] Channel closed");
  }
};
