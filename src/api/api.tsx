import axios from 'axios';
import type { GraphResponse, GroupDetailsResponse } from '../types';

const API_BASE = 'https://socialcollateral-api-228221306168.asia-southeast2.run.app/api/v1'

export function getAPIClient() {
  return axios.create({ baseURL: API_BASE })
}

export async function fetchGraph(): Promise<GraphResponse> {
  const api = getAPIClient()
  try {
    const res = await api.get<GraphResponse>('/graph')

    return res.data
  } catch (err) {
    console.error('fetchGraph error', err)
    throw err
  }
}

export async function fetchGroupDetails(groupId: string): Promise<GroupDetailsResponse> {
  const api = getAPIClient()
  try {
    const res = await api.get<GroupDetailsResponse>(`/groups/${groupId}`)

    return res.data
  } catch (err) {
    console.error('fetchGroupDetails error', err)
    throw err
  }
}

export default fetchGraph