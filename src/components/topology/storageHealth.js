const HEALTH_STATES = new Set(['empty', 'filled', 'disconnected']);

export function subscribeToStorageHealth(url, onState, WebSocketClass = WebSocket) {
  let disposed = false;
  const ws = new WebSocketClass(url);
  const disconnected = () => {
    if (!disposed) onState('disconnected');
  };

  ws.onmessage = (event) => {
    if (disposed) return;
    try {
      const data = JSON.parse(event.data);
      if (HEALTH_STATES.has(data.state)) onState(data.state);
      else disconnected();
    } catch {
      disconnected();
    }
  };
  ws.onerror = disconnected;
  ws.onclose = disconnected;

  return () => {
    disposed = true;
    ws.close();
  };
}
