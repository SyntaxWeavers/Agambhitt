import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { TopBar } from './components/TopBar.jsx'
import { AttackWorkspace } from './components/AttackWorkspace.jsx'
import { PlaybookWorkspace } from './components/PlaybookWorkspace.jsx'
import { RedTeamWorkspace } from './components/RedTeamWorkspace.jsx'
import { AuditHistoryWorkspace } from './components/AuditHistoryWorkspace.jsx'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('audit')

  const viewMap = {
    attack: <AttackWorkspace />,
    playbook: <PlaybookWorkspace />,
    redteam: <RedTeamWorkspace />,
    audit: <AuditHistoryWorkspace />,
  }

  return (
    <div className="dashboard-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="dashboard-main">
        <TopBar />
        {viewMap[activeView] ?? <RedTeamWorkspace />}
      </main>
    </div>
  )
}

export default App