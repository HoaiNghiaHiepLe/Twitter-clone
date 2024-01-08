import { Link } from 'react-router-dom'
import { PATH } from 'src/constants/path.ts'

export function NotFound() {
  return (
    <>
      <div className='container min-h-screen'>
        <div className='mt-15.5 max-sm:mt-40 max-sm:w-auto m-auto w-max flex-col text-center'>
          <h1 className='text-3.2xl max-sm:text-2xl mb-5 font-bold'>Error 404</h1>
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
