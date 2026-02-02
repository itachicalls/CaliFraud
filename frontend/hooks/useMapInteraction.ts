import { useState, useCallback } from 'react'
import { useFilterStore } from '@/stores/filters'

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: {
    id: number
    title: string
    amount: number
    schemeType: string
    county: string
  } | null
}

export function useMapInteraction() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })

  const openDetailPanel = useFilterStore((state) => state.openDetailPanel)

  const showTooltip = useCallback(
    (x: number, y: number, content: TooltipState['content']) => {
      setTooltip({
        visible: true,
        x,
        y,
        content,
      })
    },
    []
  )

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({
      ...prev,
      visible: false,
    }))
  }, [])

  const handleMarkerClick = useCallback(
    (caseId: number) => {
      openDetailPanel(caseId)
      hideTooltip()
    },
    [openDetailPanel, hideTooltip]
  )

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    handleMarkerClick,
  }
}
