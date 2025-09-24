import { createContext, useContext, useMemo, useState } from "react"

type Page = "dashboard" | "habitForm" | "habitTrackerForm"

type NavigationParams = {
  dashboard: undefined
  habitForm: { habitId?: number }
  habitTrackerForm: undefined
}

type NavigationContextType<T extends Page> = {
  page: T
  params: NavigationParams[T]
  navigate: {
    (newPage: "dashboard"): void
    (newPage: "habitForm", params: NavigationParams["habitForm"]): void
    (newPage: "habitTrackerForm"): void
  }
}

const NavigationContext = createContext<NavigationContextType<Page>>({
  page: "dashboard",
  params: undefined,
  navigate: (_: Page) => {},
})

function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>("dashboard")
  const [params, setParams] = useState<NavigationParams[Page]>(undefined)

  const navigate = (
    newPage: Page,
    navigationParams?: NavigationParams[Page]
  ) => {
    setPage(newPage)
    setParams(navigationParams as NavigationParams[Page])
  }

  const value = useMemo(
    () => ({ page, params, navigate }),
    [page, params, navigate]
  )

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = <T extends Page>() => {
  const context = useContext(NavigationContext) as NavigationContextType<T>
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}

export default NavigationProvider
