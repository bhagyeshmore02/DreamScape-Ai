import { createContext, useContext } from 'react'

export type Route = 'landing' | 'login' | 'signup' | 'forgot-password' | 'dashboard' | 'create-project'

export interface RouterCtx {
  route: Route
  navigate: (r: Route) => void
}

export const RouterContext = createContext<RouterCtx>({ route: 'landing', navigate: () => {} })

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter() {
  return useContext(RouterContext)
}
