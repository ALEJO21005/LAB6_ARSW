const BLUEPRINTS = [
  {
    author: 'Laura',
    name: 'living room',
    points: [
      { x: 10, y: 20 },
      { x: 50, y: 80 },
      { x: 100, y: 30 },
      { x: 150, y: 90 },
    ],
  },
  {
    author: 'Laura',
    name: 'kitchen',
    points: [
      { x: 5, y: 5 },
      { x: 40, y: 60 },
      { x: 80, y: 20 },
      { x: 120, y: 70 },
    ],
  },
  {
    author: 'John',
    name: 'bedroom',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  },
]

export default {
  getAll: async () => [...BLUEPRINTS],

  getByAuthor: async (author) => BLUEPRINTS.filter((bp) => bp.author === author),

  getByAuthorAndName: async (author, name) =>
    BLUEPRINTS.find((bp) => bp.author === author && bp.name === name) ?? null,

  create: async (payload) => {
    BLUEPRINTS.push(payload)
    return payload
  },

  addPoint: async (author, name, point) => {
    const bp = BLUEPRINTS.find((b) => b.author === author && b.name === name)
    if (!bp) throw new Error('Blueprint not found')
    bp.points.push(point)
    return { ...bp }
  },
}
