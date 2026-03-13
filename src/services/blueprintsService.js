import mockService from './apimock.js'
import apiService from './apiclient-service.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'false'

export default useMock ? mockService : apiService
