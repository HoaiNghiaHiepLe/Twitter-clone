import {} from 'src/assets/icons'
import SvgLogin from 'src/assets/icons/SvgLogin'
import { PATH } from 'src/constants/path'
import { NavMenuListType } from 'src/types/NavMenuList.type'

export const NAV_MENU_ITEMS: NavMenuListType[] = [
  { icon: <SvgLogin />, title: 'Home', path: PATH.HOME },
  { icon: <SvgLogin />, title: 'Login', path: PATH.LOGIN }
]
