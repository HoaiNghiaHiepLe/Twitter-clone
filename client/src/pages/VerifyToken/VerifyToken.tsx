import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TokenType } from 'src/constants/enum'
import { PATH } from 'src/constants/path'
import useQueryParams from 'src/hooks/useQueryParams'

type TokenQueryParams = {
  token: string
  endPoint: string
  tokenType: string
}

const VerifyToken = () => {
  // Lấy token, serverUrl, verifyType từ query params
  // Khi tạo url để redirect từ email về frontend, thêm query params vào url
  // Bằng cách này verifyToken page có thể dùng để verify nhiều loại token khác nhau
  //  link: `${process.env.CLIENT_URL}${PATH.USER.VERIFY_TOKEN}?token=${forgot_password_token}?serverUrl=${serverUrl}?verifyType=${verifyType}`
  // sau khi verify token thành công, redirect đến trang reset password hoặc verify email success tùy thuộc vào verifyType
  const { tokenType, endPoint, token } = useQueryParams() as TokenQueryParams

  const { VITE_API_URL } = import.meta.env
  const navigate = useNavigate()

  const [loading, setLoading] = useState<boolean>(false)

  // Hàm này dùng để xác định redirect đến trang nào sau khi verify token thành công
  const navigateAfterVerification = (
    tokenType: string,
    token: string
  ): { path: string; state?: { [key: string]: string } } => {
    switch (tokenType) {
      case String(TokenType.ForgotPasswordToken):
        return { path: PATH.RESET_PASSWORD, state: { token } }
      case String(TokenType.EmailVerifyToken):
        return { path: PATH.NOTIFICATION }
      default:
        return { path: PATH.HOME }
    }
  }

  useEffect(() => {
    // cancel gọi request 2 lần của axios ở môi trường dev
    const controller = new AbortController()

    // Xác định redirect đến trang nào sau khi verify token thành công
    const navigationInfo = navigateAfterVerification(tokenType, token)

    if (token && navigationInfo) {
      setLoading(true)
      axios
        .post(
          `${endPoint}`,
          { token },
          {
            baseURL: VITE_API_URL
            // signal: controller.signal
          }
        )
        .then((res) => {
          setLoading(false)
          navigate(navigationInfo.path, { state: { ...navigationInfo.state, message: res?.data?.message } })
        })
        .catch((err) => {
          setLoading(false)
          navigate(PATH.NOTIFICATION, { state: { ...navigationInfo.state, message: err?.response?.data?.message } })
          console.log(err?.response?.data?.message)
        })
    }

    return () => {
      controller.abort()
    }
    // useEffect này chỉ chạy 1 lần khi component mount
  }, [token, tokenType, navigate])

  if (loading) {
    return <div>Loading...</div>
  }
}

export default VerifyToken
