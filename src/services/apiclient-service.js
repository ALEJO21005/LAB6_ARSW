import api from './apiClient.js'

export default {
  getAll: async () => {
    const { data } = await api.get('/api/v1/blueprints')
    return data.data
  },

  getByAuthor: async (author) => {
    const { data } = await api.get(`/api/v1/blueprints/${encodeURIComponent(author)}`)
    return data.data
  },

  getByAuthorAndName: async (author, name) => {
    const { data } = await api.get(
      `/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return data.data
  },

  create: async (payload) => {
    const { data } = await api.post('/api/v1/blueprints', payload)
    return data.data
  },

  addPoint: async (author, name, point) => {
    const { data } = await api.put(
      `/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}/points`,
      point,
    )
    return data.data
  },

  deleteBlueprint: async (author, name) => {
    const { data } = await api.delete(
      `/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`
    )
    return data.data
  },

  deleteByAuthor: async (author) => {
    const { data } = await api.delete(
      `/api/v1/blueprints/${encodeURIComponent(author)}`
    )
    return data.data
  },

  deletePoint: async (author, name, x, y) => {
    const { data } = await api.delete(
      `/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}/points/${x}/${y}`
    )
    return data.data
  },
}
