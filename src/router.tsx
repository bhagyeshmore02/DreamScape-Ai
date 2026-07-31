import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { RouterContext } from './routerContext'
import type { Route } from './routerContext'

const VALID_ROUTES: Route[] = ['landing', 'login', 'signup', 'forgot-password']

function getRouteFromHash(): Route {
  const hash = window.location.hash.replace('#', '')
  return VALID_ROUTES.includes(hash as Route) ? (hash as Route) : 'landing'
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(getRouteFromHash)

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(r: Route) {
    window.location.hash = r
    setRoute(r)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}
