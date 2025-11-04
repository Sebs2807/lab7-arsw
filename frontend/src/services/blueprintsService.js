import apiMock from './blueprintsApiMock.js'
import apiClient from './blueprintsApiClient.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const blueprintsService = useMock ? apiMock : apiClient

export default blueprintsService
