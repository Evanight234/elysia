import { useState, useEffect } from 'react'

/**
 * Custom hook to listen for sidebar toggle events and provide
 * the current sidebar collapsed state across user pages.
 *
 * - collapsed = true → sidebar hidden (hamburger icon shown)
 *   → book grid: 6 per row, pagination limit: 12
 * - collapsed = false → sidebar open
 *   → book grid: 5 per row, pagination limit: 10
 */
export function useSidebarState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const val = localStorage.getItem('sidebar_collapsed')
    return val !== 'false' // default to true (collapsed)
  })

  useEffect(() => {
    const handleToggle = () => {
      const val = localStorage.getItem('sidebar_collapsed')
      setSidebarCollapsed(val !== 'false')
    }
    window.addEventListener('sidebar_toggle', handleToggle)
    return () => {
      window.removeEventListener('sidebar_toggle', handleToggle)
    }
  }, [])

  const toggleSidebar = () => {
    const newVal = !sidebarCollapsed
    localStorage.setItem('sidebar_collapsed', String(newVal))
    window.dispatchEvent(new Event('sidebar_toggle'))
  }

  /** The pagination limit based on sidebar state */
  const paginationLimit = sidebarCollapsed ? 12 : 10

  /** CSS class string for containers that need sidebar-responsive grid */
  const sidebarClass = sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-open'

  return { sidebarCollapsed, paginationLimit, sidebarClass, toggleSidebar }
}
