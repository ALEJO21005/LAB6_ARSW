import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.subscriptions = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.baseReconnectDelay = 1000
    this.onStatusChange = null
  }

  connect(token, onStatusChange) {
    this.onStatusChange = onStatusChange

    // Create STOMP client with SockJS
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected')
        this.connected = true
        this.reconnectAttempts = 0
        if (this.onStatusChange) {
          this.onStatusChange('connected')
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected')
        this.connected = false
        if (this.onStatusChange) {
          this.onStatusChange('disconnected')
        }
        this._handleReconnect(token)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        if (frame.headers?.message?.includes('401')) {
          localStorage.removeItem('token')
          if (globalThis.location.pathname !== '/login') {
            globalThis.location.href = '/login'
          }
        }
        if (this.onStatusChange) {
          this.onStatusChange('error')
        }
      },
      debug: (str) => {
        // Uncomment for debugging WebSocket messages
        // console.log('STOMP debug:', str)
      },
    })

    this.client.activate()
    if (this.onStatusChange) {
      this.onStatusChange('connecting')
    }
  }

  disconnect() {
    console.log('Disconnecting WebSocket...')

    // Unsubscribe all active subscriptions
    this.subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe()
      } catch (error) {
        console.warn('Error unsubscribing:', error)
      }
    })
    this.subscriptions.clear()

    // Deactivate client
    if (this.client) {
      try {
        this.client.deactivate()
      } catch (error) {
        console.warn('Error deactivating client:', error)
      }
    }

    this.connected = false
    this.reconnectAttempts = 0
  }

  subscribe(topic, callback) {
    if (!this.connected || !this.client) {
      console.warn('Cannot subscribe: not connected')
      return () => {}
    }

    try {
      console.log(`Subscribing to topic: ${topic}`)
      const subscription = this.client.subscribe(topic, callback)
      this.subscriptions.set(topic, subscription)

      return () => this.unsubscribe(topic)
    } catch (error) {
      console.error('Error subscribing to topic:', topic, error)
      return () => {}
    }
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic)
    if (subscription) {
      try {
        console.log(`Unsubscribing from topic: ${topic}`)
        subscription.unsubscribe()
        this.subscriptions.delete(topic)
      } catch (error) {
        console.warn('Error unsubscribing from topic:', topic, error)
      }
    }
  }

  _handleReconnect(token) {
    const currentToken = token || localStorage.getItem('token')
    if (!currentToken || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached')
      }
      return
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000, // Max 30 seconds
    )

    console.log(
      `Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
    )

    setTimeout(() => {
      this.reconnectAttempts++
      this.connect(currentToken, this.onStatusChange)
    }, delay)
  }
}

export default new WebSocketService()
