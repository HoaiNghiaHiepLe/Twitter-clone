import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import useQueryParams from 'src/hooks/useQueryParams'

const Login = () => {
  const { access_token: access_token_param, refresh_token: refresh_token_param } = useQueryParams()
  const { VITE_API_URL } = import.meta.env

  const navigate = useNavigate()

  useEffect(() => {
    const access_token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    if (access_token_param && refresh_token_param) {
      localStorage.setItem('access_token', access_token as string)
      localStorage.setItem('refresh_token', refresh_token as string)
      navigate(PATH.HOME)
    } else if (access_token && refresh_token) {
      navigate(PATH.HOME)
    }
    return () => {}
  }, [access_token_param, refresh_token_param])

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    axios
      .post(`${VITE_API_URL}/users/login`, { email, password })
      .then((res) => {
        if (res.data.result.access_token && res.data.result.refresh_token) {
          localStorage.setItem('access_token', res.data.result.access_token)
          localStorage.setItem('refresh_token', res.data.result.refresh_token)
          navigate(PATH.HOME)
        }
      })
      .catch((res) => {
        console.error(res)
      })
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h1>Simple login</h1>
        <div>
          <label htmlFor='email'>Email</label>
          <input className='mx-2 my-4 border-2 hover:bg-slate-50' type='text' name='email' id='email' />
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          <input className='mx-2 my-4 border-2 hover:bg-slate-50' type='text' name='password' id='password' />
        </div>
        <button className='border-2 px-4 py-1 hover:bg-blue-300' type='submit'>
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
