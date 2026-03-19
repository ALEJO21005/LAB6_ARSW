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
  async ({ author, name, point }, { getState }) => {
    const state = getState()
    const currentBlueprint = state.blueprints.current
    return await blueprintsService.addPoint(author, name, point)
  },
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }) => {
    await blueprintsService.deleteBlueprint(author, name)
    return { author, name }
  },
)

export const deleteByAuthor = createAsyncThunk(
  'blueprints/deleteByAuthor',
  async (author) => {
    await blueprintsService.deleteByAuthor(author)
    return author
  },
)

export const deletePoint = createAsyncThunk(
  'blueprints/deletePoint',
  async ({ author, name, x, y }) => {
    const result = await blueprintsService.deletePoint(author, name, x, y)
    // Re-fetch the updated blueprint to get the new point list
    const updatedBlueprint = await blueprintsService.getByAuthorAndName(author, name)
    return updatedBlueprint
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
    deleteStatus: 'idle',
    deleteError: null,
    deleteAuthorStatus: 'idle',
    deleteAuthorError: null,
    deletePointStatus: 'idle',
    deletePointError: null,
    wsStatus: 'idle',
    wsError: null,
  },
  reducers: {
    blueprintPointAdded(state, action) {
      const { author, blueprintName, allPoints } = action.payload

      // Update current blueprint if it matches
      if (state.current?.author === author && state.current?.name === blueprintName) {
        state.current = {
          ...state.current,
          points: allPoints,
        }
      }

      // Update in byAuthor collection
      if (state.byAuthor[author]) {
        const index = state.byAuthor[author].findIndex((bp) => bp.name === blueprintName)
        if (index > -1) {
          state.byAuthor[author][index] = {
            ...state.byAuthor[author][index],
            points: allPoints,
          }
        }
      }
    },

    wsConnectionChanged(state, action) {
      state.wsStatus = action.payload.status
      if (action.payload.error) {
        state.wsError = action.payload.error
      }
    },
  },
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
      .addCase(deleteBlueprint.pending, (s) => {
        s.deleteStatus = 'loading'
        s.deleteError = null
      })
      .addCase(deleteBlueprint.fulfilled, (s, a) => {
        s.deleteStatus = 'succeeded'
        const { author, name } = a.payload

        // Remove from byAuthor collection
        if (s.byAuthor[author]) {
          s.byAuthor[author] = s.byAuthor[author].filter(bp => bp.name !== name)
        }

        // Clear current if it matches the deleted blueprint
        if (s.current?.author === author && s.current?.name === name) {
          s.current = null
        }
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.deleteStatus = 'failed'
        s.deleteError = a.error.message
      })
      .addCase(deleteByAuthor.pending, (s) => {
        s.deleteAuthorStatus = 'loading'
        s.deleteAuthorError = null
      })
      .addCase(deleteByAuthor.fulfilled, (s, a) => {
        s.deleteAuthorStatus = 'succeeded'
        const author = a.payload

        // Remove all blueprints for this author
        delete s.byAuthor[author]

        // Clear current if it matches the deleted author
        if (s.current?.author === author) {
          s.current = null
        }
      })
      .addCase(deleteByAuthor.rejected, (s, a) => {
        s.deleteAuthorStatus = 'failed'
        s.deleteAuthorError = a.error.message
      })
      .addCase(deletePoint.pending, (s) => {
        s.deletePointStatus = 'loading'
        s.deletePointError = null
      })
      .addCase(deletePoint.fulfilled, (s, a) => {
        s.deletePointStatus = 'succeeded'
        const updatedBlueprint = a.payload

        // Update current blueprint if it matches
        if (s.current?.author === updatedBlueprint.author && s.current?.name === updatedBlueprint.name) {
          s.current = updatedBlueprint
        }

        // Update in byAuthor collection
        if (s.byAuthor[updatedBlueprint.author]) {
          const index = s.byAuthor[updatedBlueprint.author].findIndex(bp => bp.name === updatedBlueprint.name)
          if (index > -1) {
            s.byAuthor[updatedBlueprint.author][index] = updatedBlueprint
          }
        }
      })
      .addCase(deletePoint.rejected, (s, a) => {
        s.deletePointStatus = 'failed'
        s.deletePointError = a.error.message
      })
  },
})

export default slice.reducer

export const { blueprintPointAdded, wsConnectionChanged } = slice.actions

const selectByAuthor = (s) => s.blueprints.byAuthor

export const selectTop5ByPoints = createSelector(selectByAuthor, (byAuthor) =>
  Object.values(byAuthor)
    .flat()
    .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
    .slice(0, 5),
)
