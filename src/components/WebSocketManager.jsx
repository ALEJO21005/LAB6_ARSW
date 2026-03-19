import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import websocketService from '../services/websocketService'
import {
  blueprintPointAdded,
  wsConnectionChanged,
} from '../features/blueprints/blueprintsSlice'

export default function WebSocketManager() {
  const dispatch = useDispatch()
  const current = useSelector((state) => state.blueprints.current)
  const token = localStorage.getItem('token')

  // Connect on mount if authenticated
  useEffect(() => {
    if (!token) return

    try {
      const handleMessage = (message) => {
        try {
          const body = JSON.parse(message.body)
          console.log('WebSocket message received:', body)

          if (body.type === 'POINT_ADDED') {
            dispatch(blueprintPointAdded(body))
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      // Connect to WebSocket
      websocketService.connect(token, (status) => {
        console.log('WebSocket status changed:', status)
        dispatch(wsConnectionChanged({ status }))
      })

      // Subscribe to global topic
      websocketService.subscribe('/topic/blueprints', handleMessage)
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
      dispatch(wsConnectionChanged({ status: 'error', error: error.message }))
    }

    // Cleanup on unmount
    return () => {
      try {
        websocketService.disconnect()
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error)
      }
    }
  }, [token, dispatch])

  // Subscribe to specific blueprint topic when current changes
  useEffect(() => {
    if (!current || !websocketService.connected) return

    try {
      const topic = `/topic/blueprints/${encodeURIComponent(current.author)}/${encodeURIComponent(current.name)}`

      const handleMessage = (message) => {
        try {
          const body = JSON.parse(message.body)
          console.log('Blueprint-specific message received:', body)
          dispatch(blueprintPointAdded(body))
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      websocketService.subscribe(topic, handleMessage)

      return () => {
        try {
          websocketService.unsubscribe(topic)
        } catch (error) {
          console.error('Error unsubscribing from topic:', error)
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to blueprint topic:', error)
    }
  }, [current, dispatch])

  return null // Logical component, no UI
}
