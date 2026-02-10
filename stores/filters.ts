/**
 * Zustand store for filter state management
 */

import { create } from 'zustand'

export interface FilterState {
  // Filters
  schemeType: string | null
  typology: string | null
  county: string | null
  minAmount: number | null
  maxAmount: number | null
  startDate: string | null
  endDate: string | null
  status: string | null
  stillOperating: boolean | null

  // Time scrubber
  currentPeriod: string | null
  isPlaying: boolean

  // Selected case
  selectedCaseId: number | null

  // UI state
  sidebarOpen: boolean
  detailPanelOpen: boolean

  // Actions
  setSchemeType: (type: string | null) => void
  setTypology: (typology: string | null) => void
  setCounty: (county: string | null) => void
  setStillOperating: (v: boolean | null) => void
  setAmountRange: (min: number | null, max: number | null) => void
  setDateRange: (start: string | null, end: string | null) => void
  setStatus: (status: string | null) => void
  setCurrentPeriod: (period: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setSelectedCaseId: (id: number | null) => void
  toggleSidebar: () => void
  openDetailPanel: (caseId: number) => void
  closeDetailPanel: () => void
  clearFilters: () => void
  getActiveFilters: () => Record<string, unknown>
}

const initialState = {
  schemeType: null,
  typology: null,
  county: null,
  minAmount: null,
  maxAmount: null,
  startDate: null,
  endDate: null,
  status: null,
  stillOperating: null,
  currentPeriod: null,
  isPlaying: false,
  selectedCaseId: null,
  sidebarOpen: true,
  detailPanelOpen: false,
}

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initialState,

  setSchemeType: (type) => set({ schemeType: type }),
  setTypology: (typology) => set({ typology }),
  setCounty: (county) => set({ county }),
  setStillOperating: (v) => set({ stillOperating: v }),
  setAmountRange: (min, max) => set({ minAmount: min, maxAmount: max }),
  setDateRange: (start, end) => set({ startDate: start, endDate: end }),
  setStatus: (status) => set({ status }),
  setCurrentPeriod: (period) => set({ currentPeriod: period }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSelectedCaseId: (id) => set({ selectedCaseId: id }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  openDetailPanel: (caseId) => set({ 
    selectedCaseId: caseId, 
    detailPanelOpen: true 
  }),
  
  closeDetailPanel: () => set({ 
    selectedCaseId: null, 
    detailPanelOpen: false 
  }),

  clearFilters: () => set({
    schemeType: null,
    typology: null,
    county: null,
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
    status: null,
    stillOperating: null,
  }),

  getActiveFilters: () => {
    const state = get()
    return {
      scheme_type: state.schemeType,
      typology: state.typology,
      county: state.county,
      min_amount: state.minAmount,
      max_amount: state.maxAmount,
      start_date: state.startDate,
      end_date: state.endDate,
      status: state.status,
      still_operating: state.stillOperating === true ? 'true' : undefined,
    }
  },
}))
