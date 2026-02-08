import { useEffect, useState } from 'react'
import { useStompClient, LIVE_DATA_TOPIC } from './lib'
import './App.css'

function App() {
  const { subscribe, connected, error } = useStompClient()
  const [liveData, setLiveData] = useState(null)

  useEffect(() => {
    const sub = subscribe(LIVE_DATA_TOPIC, (msg) => {
      setLiveData(JSON.parse(msg.body))
    })
    return () => sub.unsubscribe()
  }, [subscribe])

  return (
    <div className="app">
      <h1>WebSocket Test</h1>
      <p>React SPA - built with Vite</p>

      <section>
        <h2>STOMP live data</h2>
        {error && <p className="error">Error: {error}</p>}
        {!connected && !error && <p>Connecting…</p>}
        {connected && (
          <p>
            Live value: <strong>{liveData ? liveData.value.toFixed(2) : '—'}</strong>
            {liveData?.timestamp && (
              <span className="muted"> ({new Date(liveData.timestamp).toLocaleTimeString()})</span>
            )}
          </p>
        )}
      </section>
    </div>
  )
}

export default App
