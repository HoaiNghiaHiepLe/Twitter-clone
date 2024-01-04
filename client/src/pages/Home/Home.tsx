import { Link } from 'react-router-dom'
import { getGoogleAuthUrl } from 'src/utils/googleOAuth'

const Home = () => {
  const googleOAuthUrl = getGoogleAuthUrl()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  const logOut = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }

  return (
    <div className='h-full bg-slate-700'>
      {isAuthenticated ? (
        <>
          <div className='bg-red-700'>Authenticated</div>
          <button type='button' onClick={logOut}>
            Log Out
          </button>
        </>
      ) : (
        <Link to={googleOAuthUrl}>Google Login</Link>
      )}
    </div>
  )
}

export default Home
