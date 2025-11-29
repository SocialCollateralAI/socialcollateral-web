import axios from 'axios';

const API_BASE = 'https://socialcollateral-api-228221306168.asia-southeast2.run.app/api/v1'

export function getAPIClient() {
  return axios.create({ baseURL: API_BASE })
}

export async function fetchGraph() {
  const api = getAPIClient()
  try {
    const res = await api.get('/graph')
    console.log('fetchGraph success', res.data)
    return res.data
  } catch (err) {
    console.error('fetchGraph error', err)
    throw err
  }
}

export async function fetchGroupDetails(groupId: string) {
  const api = getAPIClient()
  try {
    const res = await api.get(`/groups/${groupId}`)
    console.log('fetchGroupDetails success', res.data)
    return res.data
  } catch (err) {
    console.error('fetchGroupDetails error', err)
    throw err
  }
}

export default fetchGraph