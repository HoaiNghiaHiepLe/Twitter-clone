import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ResetPassword = () => {
  const [token, setToken] = useState<string>('')
  const location = useLocation()

  useEffect(() => {
    if (location.state.token) {
      setToken(location.state.token)
    }
    // useEffect này chỉ chạy 1 lần khi component mount
  }, [location.state.token])

  return (
    <div>
      <h1>reset password token: {token}</h1>
      <form>
        <div>
          <label htmlFor='new-password'>new password</label>
          <input
            placeholder='new password'
            autoFocus
            className='ml-3 border-2 border-blue-500'
            autoComplete=''
            type='password'
            name='new-password'
            id='new-password'
          />
        </div>
        <div>
          <label htmlFor='confirm-password'>confirm password</label>
          <input
            placeholder='confirm password'
            className='ml-3 border-2 border-blue-500'
            autoComplete=''
            type='password'
            name='confirm-password'
            id='confirm-password'
          />
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
