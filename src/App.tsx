/**
 * App.tsx - Root application component
 * Phase 3: Ultra-clean - just Provider and Layout
 */
import { DashboardProvider } from './context'
import { MainLayout } from './layout'

function App() {
  return (
    <DashboardProvider>
      <MainLayout />
    </DashboardProvider>
  )
}

export default App
