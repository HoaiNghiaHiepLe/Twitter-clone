import axios from 'axios'
import { useEffect, useState } from 'react'
import useQueryParams from 'src/hooks/useQueryParams'

const VerifyEmail = () => {
  const [message, setMessage] = useState<string>('')
  const { token } = useQueryParams()
  const { VITE_API_URL } = import.meta.env

  useEffect(() => {
    // cancel gọi request 2 lần của axios ở môi trường dev
    const controller = new AbortController()

    if (token) {
      // gửi request verify email lên server với email_verify_token: token
      axios
        .post(
          // url verify email của api server
          `users/verify-email`,
          { email_verify_token: token },
          {
            // baseURL: url của api server
            baseURL: VITE_API_URL,
            signal: controller.signal
          }
        )
        .then((response) => {
          console.log(response.data)
          setMessage(response.data.message)
          if (response.data.result) {
            localStorage.setItem('access_token', response.data.result.access_token)
            localStorage.setItem('refresh_token', response.data.result.refresh_token)
          }
        })
        .catch((error) => {
          setMessage(error.response.data.message)
        })
    }
    return () => {
      controller.abort()
    }

    // useEffect này chỉ chạy 1 lần khi component mount
  }, [token])

  return (
    <div>
      <h1>{message} with token:</h1>
      {token}
    </div>
  )
}

export default VerifyEmail
