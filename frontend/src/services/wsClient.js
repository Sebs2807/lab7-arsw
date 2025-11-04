import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import api from './apiClient'

let stompClient = null

function buildSockJsUrl() {
  const base =
    api.defaults && api.defaults.baseURL
      ? api.defaults.baseURL.replace(/\/$/, '')
      : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const token = localStorage.getItem('token')
  return `${base}/ws${token ? `?access_token=${encodeURIComponent(token)}` : ''}`
}

export function connect(onMessage) {
  const socketUrl = buildSockJsUrl()
  const socket = new SockJS(socketUrl)
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: () => {},
    onConnect: (frame) => {
      stompClient.subscribe('/topic/blueprints', (msg) => {
        try {
          onMessage(JSON.parse(msg.body))
        } catch (e) {
          onMessage(msg.body)
        }
      })
    },

    connectHeaders: (() => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    })(),
  })
  stompClient.activate()
}

export function disconnect() {
  if (stompClient) stompClient.deactivate()
}
