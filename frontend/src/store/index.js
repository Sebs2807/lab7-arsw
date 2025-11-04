import { configureStore } from '@reduxjs/toolkit'
import blueprintsReducer from '../features/blueprints/blueprintsSlice.js'

const store = configureStore({
  reducer: {
    blueprints: blueprintsReducer,
  },
})

export default store
