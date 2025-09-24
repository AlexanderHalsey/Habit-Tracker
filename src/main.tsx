import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import NavigationProvider from "./Navigation"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </Suspense>
  </React.StrictMode>
)
