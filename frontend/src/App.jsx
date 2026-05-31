import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { TopBar } from './components/TopBar.jsx'
import { AttackWorkspace } from './components/AttackWorkspace.jsx'
import { PlaybookWorkspace } from './components/PlaybookWorkspace.jsx'
import { RedTeamWorkspace } from './components/RedTeamWorkspace.jsx'
import { CountermeasuresWorkspace } from './components/CountermeasuresWorkspace.jsx'
import { AuditHistoryWorkspace } from './components/AuditHistoryWorkspace.jsx'
import { defaultTopology, defaultVulnerabilities, defaultIncidents } from './data/dashboardData.js'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('attack')
  
  // Shared state to allow seamless transitions between workspaces
  const [topology, setTopology] = useState(defaultTopology)
  const [vulnerabilities, setVulnerabilities] = useState(defaultVulnerabilities)
  const [incidents, setIncidents] = useState(defaultIncidents)
  
  const [selectedVector, setSelectedVector] = useState(null)
  const [attackChain, setAttackChain] = useState([])

  const viewMap = {
    attack: (
      <AttackWorkspace
        topology={topology}
        setTopology={setTopology}
        vulnerabilities={vulnerabilities}
        setVulnerabilities={setVulnerabilities}
        incidents={incidents}
        setIncidents={setIncidents}
        setSelectedVector={setSelectedVector}
        setActiveView={setActiveView}
      />
    ),
    playbook: (
      <PlaybookWorkspace
        selectedVector={selectedVector}
        setSelectedVector={setSelectedVector}
      />
    ),
    redteam: (
      <RedTeamWorkspace
        topology={topology}
        vulnerabilities={vulnerabilities}
        setAttackChain={setAttackChain}
        setActiveView={setActiveView}
      />
    ),
    countermeasures: (
      <CountermeasuresWorkspace
        attackChain={attackChain}
      />
    ),
    audit: (
      <AuditHistoryWorkspace />
    ),
  }

  return (
    <div className="dashboard-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="dashboard-main">
        <TopBar />
        {viewMap[activeView] ?? viewMap.attack}
      </main>
    </div>
  )
}

export default App