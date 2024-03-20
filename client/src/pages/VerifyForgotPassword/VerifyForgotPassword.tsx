import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import useQueryParams from 'src/hooks/useQueryParams'

const VerifyForgotPassword = () => {
  const { token } = useQueryParams()
  const { VITE_API_URL } = import.meta.env
  const navigate = useNavigate()

  useEffect(() => {
    // cancel gọi request 2 lần của axios ở môi trường dev
    const controller = new AbortController()
    if (token) {
      // gửi request check forgot password token lên server với forgot_password_token: token
      axios
        .post(
          // url verify email của api server
          `users/verify-forgot-password`,
          { token },
          {
            // baseURL: url của api server
            baseURL: VITE_API_URL,
            signal: controller.signal
          }
        )
        .then(() => {
          navigate(PATH.RESET_PASSWORD, { state: { token } })
        })
        .catch((err) => {
          console.log(err.response.data.message)
        })
    }
    return () => {
      controller.abort()
    }
    // useEffect này chỉ chạy 1 lần khi component mount
  }, [token])

  return <div></div>
}

export default VerifyForgotPassword
