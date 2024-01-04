import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import useQueryParams from 'src/hooks/useQueryParams'

const Login = () => {
  const { access_token, refresh_token, new_user, verify } = useQueryParams()

  const navigate = useNavigate()

  useEffect(() => {
    if (access_token && refresh_token) {
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      navigate(PATH.HOME)
    }
    return () => {}
  }, [access_token, refresh_token])

  return <div>Login page</div>
}

export default Login
