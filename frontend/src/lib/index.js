/**
 * STOMP web client for the frontend. Reusable in React or any other consumer.
 *
 * Usage (vanilla or non-React):
 *   import { createStompClient, LIVE_DATA_TOPIC } from './lib';
 *   const client = createStompClient({ brokerURL: 'ws://localhost:8080/ws' });
 *   client.connect();
 *   const sub = client.subscribe(LIVE_DATA_TOPIC, (msg) => console.log(JSON.parse(msg.body)));
 *
 * Usage (React):
 *   import { useStompClient, LIVE_DATA_TOPIC } from './lib';
 *   const { subscribe, connected, error } = useStompClient();
 *   useEffect(() => {
 *     const sub = subscribe(LIVE_DATA_TOPIC, (msg) => setData(JSON.parse(msg.body)));
 *     return () => sub.unsubscribe();
 *   }, [subscribe]);
 */

export { createStompClient, LIVE_DATA_TOPIC } from './stompClient.js';
export { useStompClient } from './useStompClient.js';
