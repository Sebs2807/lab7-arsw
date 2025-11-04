import api from './apiClient.js'

export default {
  getAll: async () => {
    const { data } = await api.get('/api/v1/blueprints')
    return data
  },

  getByAuthor: async (author) => {
    const { data } = await api.get(`/api/v1/blueprints/${author}`)
    return data.data || data
  },

  getByAuthorAndName: async (author, name) => {
    const { data } = await api.get(`/api/v1/blueprints/${author}/${name}`)
    return data.data || data
  },

  create: async (blueprint) => {
    const { data } = await api.post('/api/v1/blueprints', blueprint)
    return data.data || data
  },
}
