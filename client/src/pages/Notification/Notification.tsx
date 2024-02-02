import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PATH } from 'src/constants/path'
import { Link } from 'react-router-dom'

export default function Notification() {
  const location = useLocation()
  // const navigate = useNavigate()
  const { state } = location

  /*useEffect(() => {
    // Check if 'state' is not present and redirect
    // Redirect to home page & clear state after 3 seconds
    const timer = setTimeout(() => {
      navigate(PATH.HOME, { replace: true, state: {} })
    }, 5000)
    return () => clearTimeout(timer)
  }, [navigate]) // Depend on 'navigate' to avoid re-running on 'state' changes
  */
  const message = state?.message || 'Page not found'
  const isSuccess = state?.isSuccess

  return (
    <>
      <div className='container min-h-screen'>
        <div className='mt-15.5 max-sm:mt-40 max-sm:w-auto m-auto w-max flex-col text-center'>
          <h1 className={`text-3.2xl max-sm:text-2xl mb-5 font-bold ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </h1>
          <Link
            to={PATH.HOME}
            className='mx-auto mt-10 flex h-12.5 items-center justify-center rounded border bg-slate-500 px-4 text-xl font-semibold uppercase'
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </>
  )
}
