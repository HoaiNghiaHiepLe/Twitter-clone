import { SvgLogout } from 'src/assets/icons'

export function Header() {
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
        <div className={'mr-6'}>
          <div className={'text-xs'}>Easin Arafat</div>
          <div className={'text-xxs opacity-50'}>Free Account</div>
        </div>
        <SvgLogout />
      </div>
    </div>
  )
}
