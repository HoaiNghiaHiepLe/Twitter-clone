import NavMenuItem from '../NavMenuItem'
import { NAV_MENU_ITEMS } from 'src/constants/NavMenu'
import { NavMenuListType } from 'src/types/NavMenuList.type'

type NavMenuProps = {
  className?: string
  isMenuOpen?: boolean
}

const NavMenu = ({ className = 'mx-3.5 mt-24 w-full', isMenuOpen }: NavMenuProps) => {
  return (
    <div className={className}>
      {NAV_MENU_ITEMS.map((item: NavMenuListType) => (
        <NavMenuItem
          key={item.path}
          icon={item.icon}
          title={item.title}
          path={item.path}
          isMenuOpen={isMenuOpen}
          badgeCount={item.badge}
        />
      ))}
    </div>
  )
}

export default NavMenu
