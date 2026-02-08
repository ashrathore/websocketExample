import { Client } from '@stomp/stompjs';

/**
 * Default WebSocket URL for the backend (STOMP endpoint).
 * Override via options when creating the client.
 */
const DEFAULT_BROKER_URL = 'ws://localhost:8080/ws';

/**
 * Creates a STOMP web client that can connect to the backend, subscribe to topics,
 * and disconnect. Intended for reuse in React (e.g. via hooks or context) or any other consumer.
 *
 * @param {Object} options
 * @param {string} [options.brokerURL] - WebSocket URL (e.g. 'ws://localhost:8080/ws')
 * @param {() => void} [options.onConnect] - Called when connection is established
 * @param {(error: string) => void} [options.onError] - Called on connection/STOMP errors
 * @param {() => void} [options.onDisconnect] - Called when connection closes
 * @returns {StompClientApi} Client API with connect, disconnect, subscribe, isConnected
 */
export function createStompClient(options = {}) {
  const brokerURL = options.brokerURL ?? DEFAULT_BROKER_URL;
  let stompClient = null;
  let subscriptions = [];

  const applySubscriptions = () => {
    if (!client.connected) return;
    subscriptions.forEach((sub) => {
      if (sub._stompSubscription) return;
      sub._stompSubscription = client.subscribe(sub.destination, (message) => {
        sub.callback(message);
      });
    });
  };

  const client = new Client({
    brokerURL,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      applySubscriptions();
      options.onConnect?.();
    },
    onStompError: (frame) => {
      options.onError?.(frame.headers?.message ?? frame.toString());
    },
    onWebSocketClose: () => {
      subscriptions.forEach((sub) => {
        sub._stompSubscription = null;
      });
      options.onDisconnect?.();
    },
  });

  return {
    /**
     * Connect to the STOMP broker. Idempotent if already connected.
     */
    connect() {
      if (stompClient) return;
      stompClient = client;
      client.activate();
    },

    /**
     * Disconnect and deactivate the client. Clears all subscriptions.
     */
    disconnect() {
      if (!stompClient) return;
      subscriptions.forEach((sub) => sub.unsubscribe());
      subscriptions = [];
      client.deactivate();
      stompClient = null;
    },

    /**
     * Subscribe to a STOMP destination (e.g. '/topic/live-data').
     * Must be called after connect; subscription is established when the client is connected.
     *
     * @param {string} destination - STOMP destination (topic or queue)
     * @param {(message: { body: string }) => void} callback - Invoked for each message; body is raw string (often JSON)
     * @returns {{ unsubscribe: () => void }} Subscription handle to unsubscribe
     */
    subscribe(destination, callback) {
      const sub = {
        destination,
        callback,
        _stompSubscription: null,
        unsubscribe: () => {
          if (sub._stompSubscription) {
            sub._stompSubscription.unsubscribe();
          }
          subscriptions = subscriptions.filter((s) => s !== sub);
        },
      };
      subscriptions.push(sub);

      if (client.connected) {
        applySubscriptions();
      }

      return {
        unsubscribe: () => sub.unsubscribe(),
      };
    },

    /**
     * @returns {boolean} True if the client is connected and ready for subscriptions.
     */
    isConnected() {
      return client?.connected ?? false;
    },

    /**
     * @returns {string} Current broker URL.
     */
    getBrokerURL() {
      return brokerURL;
    },
  };
}

/**
 * Topic for live data from the backend (random 90–100 values).
 * Use with createStompClient().subscribe(LIVE_DATA_TOPIC, callback).
 */
export const LIVE_DATA_TOPIC = '/topic/live-data';
