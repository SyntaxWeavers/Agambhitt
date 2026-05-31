import { navigationItems, supportItems } from '../data/dashboardData.js'

function SidebarLink({ icon, label, active = false, onClick, view }) {
  return (
    <button
      className={`nav-link${active ? ' is-active' : ''}`}
      onClick={() => onClick?.(view)}
      type="button"
    >
      <span className="material-symbols-outlined nav-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="nav-label app-heading">{label}</span>
    </button>
  )
}

export function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar-card">
      <div className="brand-block">
        <p className="brand-title app-heading">AgamBhitt</p>
        <p className="brand-subtitle">SOC Command Center</p>
      </div>

      <nav className="nav-list" aria-label="Primary">
        {navigationItems.map((item) => (
          <SidebarLink
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={item.view === activeView}
            onClick={onNavigate}
            view={item.view}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="new-simulation" type="button">
          New Simulation
        </button>

        <div className="sidebar-actions" aria-label="Secondary">
          {supportItems.map((item) => (
            <button className="sidebar-link" key={item.label} type="button">
              <span className="material-symbols-outlined nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label app-heading">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}