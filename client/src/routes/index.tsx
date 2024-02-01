import { Navigate, Outlet, useLocation, useRoutes } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import MainLayout from 'src/layouts/MainLayout'
import { Login } from 'src/pages'
import Home from 'src/pages/Home'
import NotFound from 'src/pages/NotFound'
import VerifyEmail from 'src/pages/VerifyEmail'

function UnAuthenticatedRoute() {
  const isAuthenticated = false
  const location = useLocation()
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' state={{ from: location }} replace />
}

function AuthenticatedRoute() {
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
          element: <UnAuthenticatedRoute />,
          children: [
            {
              path: PATH.HOME,
              element: <Home />
            },
            {
              path: PATH.LOGIN,
              element: <Login />
            },
            {
              path: PATH.VERIFY_EMAIL,
              element: <VerifyEmail />
            }
          ]
        },
        {
          path: '',
          element: <AuthenticatedRoute />,
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
