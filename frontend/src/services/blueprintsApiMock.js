let mockData = [
  {
    author: 'Sebastian',
    name: 'Casa',
    points: [
      { x: 40, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 40 },
      { x: 40, y: 40 },
      { x: 40, y: 20 },
      { x: 25, y: 10 },
      { x: 10, y: 20 },
    ],
  },
  {
    author: 'Camilo',
    name: 'Prueba',
    points: [
      { x: 15, y: 25 },
      { x: 35, y: 45 },
    ],
  },
]

export default {
  getAll: async () => {
    return [...mockData]
  },

  getByAuthor: async (author) => {
    return mockData.filter((bp) => bp.author === author)
  },

  getByAuthorAndName: async (author, name) => {
    return mockData.find((bp) => bp.author === author && bp.name === name) || null
  },

  addPoint: async ({ author, name, point }) => {
    const bp = mockData.find((b) => b.author === author && b.name === name)
    if (!bp) throw new Error('Blueprint not found')
    bp.points.push(point)
    return bp
  },

  create: async (blueprint) => {
    mockData.push(blueprint)
    return blueprint
  },
}
