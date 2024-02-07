import { Navigate, Outlet, useLocation, useRoutes } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import MainLayout from 'src/layouts/MainLayout'
import { Login } from 'src/pages'
import Chat from 'src/pages/Chat'
import Home from 'src/pages/Home'
import Notification from 'src/pages/Notification'
import NotFound from 'src/pages/Notification'
import ResetPassword from 'src/pages/ResetPassword'
import VerifyEmail from 'src/pages/VerifyEmail'
import VerifyForgotPassword from 'src/pages/VerifyForgotPassword'
import VerifyToken from 'src/pages/VerifyToken'

function UnAuthenticatedRoute() {
  const isAuthenticated = false
  const location = useLocation()
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' state={{ from: location }} replace />
}

function AuthenticatedRoute() {
  const access_token = localStorage.getItem('access_token')
  const refresh_token = localStorage.getItem('refresh_token')

  const isAuthenticated = access_token && refresh_token ? true : false

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
              path: PATH.VERIFY_TOKEN,
              element: <VerifyToken />
            },
            {
              path: PATH.VERIFY_EMAIL,
              element: <VerifyEmail />
            },
            {
              path: PATH.VERIFY_FORGOT_PASSWORD,
              element: <VerifyForgotPassword />
            },
            {
              path: PATH.RESET_PASSWORD,
              element: <ResetPassword />
            }
          ]
        },
        {
          path: '',
          element: <AuthenticatedRoute />,
          children: [
            {
              path: PATH.CHAT,
              element: <Chat />
            }
          ]
        },
        {
          path: PATH.NOTIFICATION,
          element: <Notification />
        }
      ]
    }
  ])
}
export default useRouteElement
