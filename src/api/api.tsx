import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export function getAPIClient() {
  return axios.create({ baseURL: API_BASE })
}

export async function fetchGraph() {
  const api = getAPIClient()
  try {
    const res = await api.get('/graph')
    return res.data
  } catch (err) {
    console.error('fetchGraph error', err)
    throw err
  }
}

export default fetchGraph