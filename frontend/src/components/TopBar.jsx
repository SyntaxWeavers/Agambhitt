export function TopBar() {
  return (
    <header className="topbar-card dashboard-topbar">
      <label className="search-shell" htmlFor="threat-search">
        <span className="material-symbols-outlined topbar-icon" aria-hidden="true">
          search
        </span>
        <input
          id="threat-search"
          className="search-input"
          placeholder="Search threats, assets, or logs..."
          type="search"
        />
      </label>

      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined topbar-icon" aria-hidden="true">
            notifications
          </span>
        </button>

        <button className="icon-button" type="button" aria-label="Toggle theme">
          <span className="material-symbols-outlined topbar-icon" aria-hidden="true">
            dark_mode
          </span>
        </button>

        <div className="profile-avatar" aria-hidden="true">
          <img
            alt=""
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFT25uF3k4aKV8XImVfjeLCHFePrvX4VyTm_qB88rTCac7LN3Kuc5HdO6lYLAHvYp8tg5S_0CjqpPCRY7V082EZxMfYTmaHaZX9nZK_fa4uF1ANcFEUFqkMfmTjKiOf7_Cx4HdKXps4AA5WuNFOSC3T93qAgqhKCBOhR1zMx93BYzPUTzlAw8K7YUhEOXLOr-Yw2v_d1mayVASC-d77CRUU7o32VvWKXIoKJKFLvJkB_6Df2TZ6ACjciiex0Cu0xODekk4rWFcmLcq"
          />
        </div>
      </div>
    </header>
  )
}