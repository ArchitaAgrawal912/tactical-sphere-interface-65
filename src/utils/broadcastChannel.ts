/**
 * BroadcastChannel API utility for cross-tab real-time communication.
 * Allows Site Centre to instantly trigger events on the Dashboard.
 */

const CHANNEL_NAME = "guardian_vision_sync";

// Message types for type safety
export type BroadcastMessageType = 
  | "NEW_INCIDENT"
  | "WORKER_UPDATE"
  | "BROADCAST_MESSAGE"
  | "TRIGGER_EFFECT"
  | "PROTOCOL_ACTIVATE";

export interface BroadcastPayload {
  type: BroadcastMessageType;
  payload: any;
  timestamp: number;
  source: "site-centre" | "dashboard";
}

// Singleton channel instance
let channel: BroadcastChannel | null = null;

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
 * Send a message to all other tabs
 */
export const broadcast = (type: BroadcastMessageType, payload: any, source: "site-centre" | "dashboard" = "site-centre") => {
  const message: BroadcastPayload = {
    type,
    payload,
    timestamp: Date.now(),
    source,
  };
  
  getChannel().postMessage(message);
  console.log(`[BROADCAST] Sent ${type}:`, payload);
};

/**
 * Subscribe to incoming messages from other tabs
 */
export const subscribe = (callback: (message: BroadcastPayload) => void): (() => void) => {
  const ch = getChannel();
  
  const handler = (event: MessageEvent<BroadcastPayload>) => {
    console.log(`[BROADCAST] Received ${event.data.type}:`, event.data.payload);
    callback(event.data);
  };
  
  ch.onmessage = handler;
  
  // Return cleanup function
  return () => {
    ch.onmessage = null;
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
