import { create } from 'zustand'
import { Report, ReportStatus } from '../types'

interface ReportState {
  currentReport: Report | null
  currentReportId: string | null
  reportStatus: ReportStatus | null
  isGenerating: boolean
  generationStep: string
  setCurrentReport: (report: Report | null) => void
  setCurrentReportId: (id: string | null) => void
  setReportStatus: (status: ReportStatus | null) => void
  setIsGenerating: (generating: boolean) => void
  setGenerationStep: (step: string) => void
  reset: () => void
}

export const useReportStore = create<ReportState>((set) => ({
  currentReport: null,
  currentReportId: null,
  reportStatus: null,
  isGenerating: false,
  generationStep: '',
  setCurrentReport: (report) => set({ currentReport: report }),
  setCurrentReportId: (id) => set({ currentReportId: id }),
  setReportStatus: (status) => set({ reportStatus: status }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationStep: (generationStep) => set({ generationStep }),
  reset: () => set({
    currentReport: null,
    currentReportId: null,
    reportStatus: null,
    isGenerating: false,
    generationStep: '',
  }),
}))
