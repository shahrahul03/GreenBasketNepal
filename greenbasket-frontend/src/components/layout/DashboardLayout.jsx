import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardSidebar, DashboardHeader } from './DashboardSidebar'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface-50">
      <DashboardSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardHeader onToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
