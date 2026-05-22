import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'
import {
  User,
  Report,
  ReportListItem,
  ReportStatusResponse,
  SearchParams,
  CheckoutSessionResponse,
  PortalSessionResponse,
  Product,
  CompareResponse,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  // 45 s — comfortably above API Gateway's 29 s hard limit so we always get
  // the server's own error response rather than a silent client timeout.
  timeout: 45_000,
})

// Attach Cognito JWT to every request
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Not authenticated — proceed without token
  }
  return config
})

// ─── Auth ────────────────────────────────────────────────────────────────────

export const syncUser = async (): Promise<User> => {
  const { data } = await api.post<User>('/v1/auth/sync')
  return data
}

// ─── User ────────────────────────────────────────────────────────────────────

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/v1/user/me')
  return data
}

export const deleteAccount = async (): Promise<void> => {
  await api.delete('/v1/user/me')
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const submitSearch = async (
  params: SearchParams,
): Promise<ReportStatusResponse> => {
  const { data } = await api.post<ReportStatusResponse>('/v1/reports/search', params)
  return data
}

export const getReportStatus = async (
  reportId: string,
): Promise<ReportStatusResponse> => {
  const { data } = await api.get<ReportStatusResponse>(`/v1/reports/${reportId}/status`)
  return data
}

export const getReport = async (reportId: string): Promise<Report> => {
  const { data } = await api.get<Report>(`/v1/reports/${reportId}`)
  return data
}

export const getMyReports = async (): Promise<ReportListItem[]> => {
  const { data } = await api.get<ReportListItem[]>('/v1/reports')
  return data
}

export const deleteReport = async (reportId: string): Promise<void> => {
  await api.delete(`/v1/reports/${reportId}`)
}

export const deleteAllReports = async (): Promise<{ deleted: number }> => {
  const { data } = await api.delete<{ deleted: number }>('/v1/reports')
  return data
}

export const compareReports = async (reportIds: string[]): Promise<CompareResponse> => {
  const { data } = await api.post<CompareResponse>('/v1/reports/compare', { report_ids: reportIds })
  return data
}

// ─── Products ────────────────────────────────────────────────────────────────

export const getTrendingProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/v1/products/trending')
  return data
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export const createCheckoutSession = async (): Promise<CheckoutSessionResponse> => {
  const { data } = await api.post<CheckoutSessionResponse>('/v1/billing/create-checkout-session')
  return data
}

export const createPortalSession = async (): Promise<PortalSessionResponse> => {
  const { data } = await api.post<PortalSessionResponse>('/v1/billing/portal')
  return data
}
