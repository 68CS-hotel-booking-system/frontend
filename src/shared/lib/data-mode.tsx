import { useState, type ReactNode } from 'react'
import { DataModeContext, type DataSourceMode } from './data-mode-context'

export function DataModeProvider({
  children,
  initialMode,
}: {
  children: ReactNode
  initialMode?: DataSourceMode
}) {
  const [mode, setModeState] = useState<DataSourceMode>(() => {
    if (initialMode) return initialMode
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stayvibe_data_source_mode') as DataSourceMode | null
      if (saved === 'api' || saved === 'mock') return saved
    }
    return 'api'
  })

  const setMode = (newMode: DataSourceMode) => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('stayvibe_data_source_mode', newMode)
    }
  }

  return (
    <DataModeContext.Provider value={{ mode, setMode }}>
      {children}
    </DataModeContext.Provider>
  )
}
