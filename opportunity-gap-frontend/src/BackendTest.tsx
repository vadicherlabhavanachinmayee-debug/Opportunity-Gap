
import { useEffect, useState } from 'react'

function BackendTest() {
  const [message, setMessage] = useState('Connecting to backend...')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend request failed')
        }
        return response.json()
      })
      .then((data) => {
        setMessage(data.message)
        setStatus('success')
      })
      .catch(() => {
        setMessage('Could not connect to the backend.')
        setStatus('error')
      })
  }, [])

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2>Backend Connection Test</h2>
      <p>{message}</p>
      <strong>
        Status: {status === 'success' ? 'Connected' : status === 'error' ? 'Failed' : 'Connecting'}
      </strong>
    </div>
  )
}

export default BackendTest
