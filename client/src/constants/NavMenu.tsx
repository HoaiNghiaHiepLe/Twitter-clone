import { SvgChat, SvgHome } from 'src/assets/icons'
import SvgLogin from 'src/assets/icons/SvgLogin'
import { PATH } from 'src/constants/path'
import { NavMenuListType } from 'src/types/NavMenuList.type'

export const NAV_MENU_ITEMS: NavMenuListType[] = [
  { icon: <SvgHome />, title: 'Home', path: PATH.HOME },
  { icon: <SvgLogin />, title: 'Login', path: PATH.LOGIN },
  { icon: <SvgChat />, title: 'Chat', path: PATH.CHAT }
]
