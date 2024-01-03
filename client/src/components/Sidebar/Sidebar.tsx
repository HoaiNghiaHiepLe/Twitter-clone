import { useState } from 'react'
import NavMenu from './components/NavMenu'
import classNames from 'classnames'

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true)

  return (
    <div
      className={classNames('cursor-pointer', {
        'w-54': isMenuOpen,
        'w-fit': !isMenuOpen
      })}
    >
      <div
        className={classNames('flex pl-3.5', {
          'mt-7.5 pr-6': isMenuOpen,
          'mt-7 pr-2': !isMenuOpen
        })}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        role='button'
        aria-hidden='true'
      >
        {isMenuOpen ? <>Close</> : <>Open</>}
      </div>

      <NavMenu className='mt-24' isMenuOpen={isMenuOpen} />
    </div>
  )
}

export default Sidebar
