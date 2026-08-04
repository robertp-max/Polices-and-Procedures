import { Link } from 'react-router-dom'
import { ArrowUpRight, Link2 } from 'lucide-react'
import type { RelatedLink } from '../data/workspace'
import { ROUTE_RELATED } from '../data/workspace'
import './related-nav.css'

/**
 * Cross-nav chip strip so redesign screens stay connected.
 * Prefer explicit `links`; otherwise resolve from ROUTE_RELATED[route].
 */
export function RelatedNav(props: {
  route?: string
  links?: RelatedLink[]
  label?: string
}) {
  const links = props.links ?? (props.route ? ROUTE_RELATED[props.route] : undefined) ?? []
  if (links.length === 0) return null

  return (
    <nav className="relnav" aria-label={props.label ?? 'Related workspaces'}>
      <span className="relnav-kicker">
        <Link2 size={13} strokeWidth={2} aria-hidden />
        Related
      </span>
      <ul className="relnav-list">
        {links.map(link => (
          <li key={link.to + link.label}>
            <Link to={link.to} className="relnav-chip" title={link.detail ?? link.label}>
              <span>{link.label}</span>
              <ArrowUpRight size={12} strokeWidth={2.25} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
