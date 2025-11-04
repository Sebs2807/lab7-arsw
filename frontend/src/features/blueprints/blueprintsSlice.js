import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const data = await blueprintsService.getAll()
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const blueprint = await blueprintsService.getByAuthorAndName(author, name)
    return blueprint
  },
)

export const addPoint = createAsyncThunk('blueprints/addPoint', async ({ author, name, point }) => {
  if (typeof blueprintsService.addPoint === 'function') {
    return blueprintsService.addPoint({ author, name, point })
  }

  const blueprint = await blueprintsService.addPoint({ author, name, point })
  return blueprint
})

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const blueprint = await blueprintsService.create(payload)
  return blueprint
})

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    blueprintAddedOrUpdated: (state, action) => {
      const bp = action.payload
      if (!bp || !bp.author || !bp.name) return
      const currentList = state.byAuthor[bp.author] || []
      const existingIndex = currentList.findIndex((b) => b.name === bp.name)
      let updatedList = [...currentList]
      if (existingIndex !== -1) {
        updatedList[existingIndex] = bp
      } else {
        updatedList.push(bp)
      }

      state.byAuthor[bp.author] = updatedList
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })

      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.byAuthor[a.payload.author] = a.payload.items
      })

      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })

      .addCase(addPoint.fulfilled, (s, a) => {
        const { author, name, point } = a.payload
        const bpList = s.byAuthor[author]
        if (bpList) {
          const bp = bpList.find((b) => b.name === name)
          if (bp) bp.points.push(point)
        }
      })
  },  
})

export default slice.reducer

export const { blueprintAddedOrUpdated } = slice.actions
