import axios from 'axios'
import { Link } from 'react-router-dom'
import { SvgLogin, SvgLogout } from 'src/assets/icons'
import { PATH } from 'src/constants/path'

export function Header() {
  const { VITE_API_URL } = import.meta.env
  const profile = JSON.parse(localStorage.getItem('profile') as string) || {}

  const isAuthenticaed = Boolean(localStorage.getItem('access_token'))

  const handleLogout = () => {
    // gửi request logout lên server
    axios
      .post(
        // url logout của api server
        `users/logout`,
        {
          refresh_token: localStorage.getItem('refresh_token')
        },
        {
          // baseURL: url của api server
          baseURL: VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      )
      .then((response) => {
        console.log(response.data)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('profile')
        window.location.reload()
      })
      .catch((error) => {
        console.log(error.response.data.message)
      })
  }

  return (
    <div className={'flex justify-between bg-white px-6 py-7'}>
      <div className={''}>Twitter</div>
      <div className={'flex items-center'}>
        <div className={'mr-4'}>
          <img
            src='../../assets/images/avatar.png'
            alt='avatar'
            className={'header-avatar h-10 w-10 rounded-xl bg-gray-200'}
          />
        </div>
        {isAuthenticaed ? (
          <>
            <div className={'mr-6'}>
              <div className={'text-xs'}>
                <strong>{profile.email}</strong>
              </div>
              <div className={'text-xxs opacity-50'}>Free Account</div>
            </div>
            <div className='hover:cursor-pointer' onClick={() => handleLogout()}>
              <SvgLogout />
            </div>
          </>
        ) : (
          <>
            <Link className='flex items-center justify-between' to={PATH.LOGIN}>
              Login <SvgLogin />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
