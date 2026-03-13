import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    return await blueprintsService.getByAuthorAndName(author, name)
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  return await blueprintsService.create(payload)
})

export const addPoint = createAsyncThunk(
  'blueprints/addPoint',
  async ({ author, name, point }) => {
    return await blueprintsService.addPoint(author, name, point)
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
    currentStatus: 'idle',
    createStatus: 'idle',
    createError: null,
    addPointStatus: 'idle',
    addPointError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchByAuthor.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchBlueprint.pending, (s) => {
        s.currentStatus = 'loading'
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.currentStatus = 'succeeded'
        s.current = a.payload
      })
      .addCase(fetchBlueprint.rejected, (s) => {
        s.currentStatus = 'failed'
      })
      .addCase(createBlueprint.pending, (s) => {
        s.createStatus = 'loading'
        s.createError = null
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        s.createStatus = 'succeeded'
        const bp = a.payload
        if (!s.byAuthor[bp.author]) {
          s.byAuthor[bp.author] = []
        }
        const index = s.byAuthor[bp.author].findIndex((b) => b.name === bp.name)
        if (index > -1) {
          s.byAuthor[bp.author][index] = bp
        } else {
          s.byAuthor[bp.author].push(bp)
        }
        if (s.current && s.current.name === bp.name && s.current.author === bp.author) {
          s.current = bp
        }
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.createStatus = 'failed'
        s.createError = a.error.message
      })
      .addCase(addPoint.pending, (s) => {
        s.addPointStatus = 'loading'
        s.addPointError = null
      })
      .addCase(addPoint.fulfilled, (s, a) => {
        s.addPointStatus = 'succeeded'
        const bp = a.payload
        s.current = bp
        if (s.byAuthor[bp.author]) {
          const index = s.byAuthor[bp.author].findIndex((b) => b.name === bp.name)
          if (index > -1) s.byAuthor[bp.author][index] = bp
        }
      })
      .addCase(addPoint.rejected, (s, a) => {
        s.addPointStatus = 'failed'
        s.addPointError = a.error.message
      })
  },
})

export default slice.reducer

const selectByAuthor = (s) => s.blueprints.byAuthor

export const selectTop5ByPoints = createSelector(selectByAuthor, (byAuthor) =>
  Object.values(byAuthor)
    .flat()
    .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
    .slice(0, 5),
)
