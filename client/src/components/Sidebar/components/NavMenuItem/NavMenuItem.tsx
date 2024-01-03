import { Badge } from 'antd'
import classNames from 'classnames'
import React from 'react'
import { NavLink } from 'react-router-dom'

type NavMenuItemProps = {
  path: string
  navClassName?: string
  iconClassName?: string
  titleClassName?: string
  badgeColor?: string
  icon: JSX.Element
  title: string | JSX.Element
  isMenuOpen?: boolean
  badgeCount?: number
  badgeTextColor?: string
}

const NavMenuItem = ({
  path,
  navClassName = '',
  iconClassName,
  titleClassName,
  badgeColor = 'var(--light-secondary-background)',
  icon,
  title,
  isMenuOpen,
  badgeCount,
  badgeTextColor = 'var(--light-secondary)'
}: NavMenuItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        classNames(`${navClassName} flex w-full py-3.5 pl-3.5`, {
          'bg-light-background text-light-primary': isActive,
          'text-gray-9a': !isActive,
          'pr-14': isMenuOpen,
          'pr-0': !isMenuOpen
        })
      }
    >
      {({ isActive }) => (
        <>
          <div className='ml-3.5 mr-3.5'>
            {React.cloneElement(icon, {
              className: classNames(`${iconClassName}`, {
                'fill-light-primary': isActive,
                'fill-gray-9a': !isActive
              })
            })}
          </div>
          {isMenuOpen ? <div className={titleClassName}>{title}</div> : null}

          {Boolean(badgeCount) && (
            <Badge
              className={classNames('pl-3', {
                hidden: !isMenuOpen
              })}
              color={badgeColor}
              count={badgeCount}
              style={{ color: `${badgeTextColor}` }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export default NavMenuItem
