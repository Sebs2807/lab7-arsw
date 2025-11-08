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

export const addPoint = createAsyncThunk(
  'blueprints/addPoint',
  async ({ author, name, point }, thunkAPI) => {
    if (typeof blueprintsService.addPoint === 'function') {
      await blueprintsService.addPoint({ author, name, point })
      const blueprint = await blueprintsService.getByAuthorAndName(author, name)
      return blueprint
    }

    const blueprint = await blueprintsService.addPoint({ author, name, point })
    return blueprint
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const blueprint = await blueprintsService.create(payload)
  return blueprint
})

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }, thunkAPI) => {
    if (typeof blueprintsService.delete !== 'function') {
      throw new Error('Delete not supported by service')
    }
    await blueprintsService.delete({ author, name })
    return { author, name }
  },
)

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ author, name, blueprint }, thunkAPI) => {
    if (typeof blueprintsService.update !== 'function') {
      throw new Error('Update not supported by service')
    }
    const updated = await blueprintsService.update({ author, name, blueprint })
    return updated
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
      if (state.current && state.current.author === bp.author && state.current.name === bp.name) {
        state.current = bp
      }
    },
    blueprintRemoved: (state, action) => {
      const { author, name } = action.payload || {}
      if (!author || !name) return
      const list = state.byAuthor[author] || []
      state.byAuthor[author] = list.filter((b) => b.name !== name)
      if (state.current && state.current.author === author && state.current.name === name) {
        state.current = null
      }
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

      .addCase(fetchBlueprint.pending, (s, a) => {
        const { author, name } = a.meta.arg
        s.current = {
          author,
          name,
          points: s.byAuthor[author]?.find((b) => b.name === name)?.points || [],
        }
      })

      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })

      .addCase(addPoint.fulfilled, (s, a) => {
        const bp = a.payload
        if (!bp || !bp.author || !bp.name) return
        const currentList = s.byAuthor[bp.author] || []
        const existingIndex = currentList.findIndex((b) => b.name === bp.name)
        let updatedList = [...currentList]
        if (existingIndex !== -1) {
          updatedList[existingIndex] = bp
        } else {
          updatedList.push(bp)
        }
        s.byAuthor[bp.author] = updatedList

        if (s.current && s.current.author === bp.author && s.current.name === bp.name) {
          s.current = bp
        }
      })
      .addCase(deleteBlueprint.fulfilled, (s, a) => {
        const { author, name } = a.payload
        const list = s.byAuthor[author] || []
        s.byAuthor[author] = list.filter((b) => b.name !== name)
        if (s.current && s.current.author === author && s.current.name === name) {
          s.current = null
        }
      })

      .addCase(updateBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (!bp || !bp.author || !bp.name) return
        const currentList = s.byAuthor[bp.author] || []
        const existingIndex = currentList.findIndex((b) => b.name === bp.name)
        let updatedList = [...currentList]
        if (existingIndex !== -1) {
          updatedList[existingIndex] = bp
        } else {
          updatedList.push(bp)
        }
        s.byAuthor[bp.author] = updatedList
        if (s.current && s.current.author === bp.author && s.current.name === bp.name) {
          s.current = bp
        }
      })
  },
})

export default slice.reducer

export const { blueprintAddedOrUpdated, blueprintRemoved } = slice.actions
