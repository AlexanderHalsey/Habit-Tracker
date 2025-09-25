import { Suspense } from "react"

import NavigationProvider from "./Navigation"
import MainLayout from "./layouts/Main"

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NavigationProvider>
        <MainLayout />
      </NavigationProvider>
    </Suspense>
  )
}

export default App
