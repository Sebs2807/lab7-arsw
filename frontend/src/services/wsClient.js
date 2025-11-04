import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from './apiClient'

let stompClient = null

function buildStompWsUrl() {
  const base =
    api.defaults && api.defaults.baseURL
      ? api.defaults.baseURL.replace(/\/$/, '')
      : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  return `${base}/ws-blueprints`
}

export function connect(onMessage) {
  const socketUrl = buildStompWsUrl()

  const socket = new SockJS(socketUrl)
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: () => {},
    reconnectDelay: 5000,
    connectHeaders: (() => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    })(),
    onConnect: () => {
      stompClient.subscribe('/topic/blueprints', (msg) => {
        try {
          onMessage(JSON.parse(msg.body))
        } catch {
          onMessage(msg.body)
        }
      })
    },
  })

  stompClient.activate()
}

export function disconnect() {
  if (stompClient) stompClient.deactivate()
}
