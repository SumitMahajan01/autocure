import { forwardRef } from 'react'
import type { NavLinkProps } from 'react-router-dom'
import { NavLink as RouterNavLink } from 'react-router-dom'
import { cn } from '../lib/utils'

interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: string
  activeClassName?: string
  pendingClassName?: string
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        {...props}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
      />
    )
  }
)

NavLink.displayName = 'NavLink'
