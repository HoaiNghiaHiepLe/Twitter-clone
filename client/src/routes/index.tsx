import { Navigate, Outlet, useLocation, useRoutes } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import MainLayout from 'src/layouts/MainLayout'
import { Login } from 'src/pages'
import Home from 'src/pages/Home'
import NotFound from 'src/pages/NotFound'

function RejectedRoute() {
  const isAuthenticated = false
  const location = useLocation()
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' state={{ from: location }} replace />
}

function ProtectedRoute() {
  const isAuthenticated = true
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to={PATH.LOGIN} state={{ from: location }} replace />
}

const useRouteElement = () => {
  return useRoutes([
    {
      path: '',
      element: <MainLayout />,
      children: [
        {
          path: '',
          element: <RejectedRoute />,
          children: [
            {
              path: PATH.HOME,
              element: <Home />
            },
            {
              path: PATH.LOGIN,
              element: <Login />
            }
          ]
        },
        {
          path: '',
          element: <ProtectedRoute />,
          children: []
        },
        {
          path: '*',
          element: <NotFound />
        }
      ]
    }
  ])
}
export default useRouteElement
