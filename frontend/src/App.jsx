import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { TopBar } from './components/TopBar.jsx'
import { AttackWorkspace } from './components/AttackWorkspace.jsx'
import { PlaybookWorkspace } from './components/PlaybookWorkspace.jsx'
import { RedTeamWorkspace } from './components/RedTeamWorkspace.jsx'
import { CountermeasuresWorkspace } from './components/CountermeasuresWorkspace.jsx'
import { AuditHistoryWorkspace } from './components/AuditHistoryWorkspace.jsx'
import { defaultTopology } from './data/dashboardData.js'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('attack')
  
  // Lifted state to persist across tab changes
  const [topology, setTopology] = useState(defaultTopology)
  const [topologyStr, setTopologyStr] = useState(JSON.stringify(defaultTopology, null, 2))
  const [attackVectors, setAttackVectors] = useState([])
  const [graphNodes, setGraphNodes] = useState([])
  const [graphEdges, setGraphEdges] = useState([])
  const [selectedVecId, setSelectedVecId] = useState(null)
  
  const [selectedVector, setSelectedVector] = useState(null)
  const [incidentDesc, setIncidentDesc] = useState(
    'Detected abnormal outbound activity mimicking the predicted attack sequence.'
  )
  const [playbook, setPlaybook] = useState(null)
  
  const [attackChain, setAttackChain] = useState([])
  
  const [countermeasures, setCountermeasures] = useState([])

  const viewMap = {
    attack: (
      <AttackWorkspace
        topology={topology}
        setTopology={setTopology}
        topologyStr={topologyStr}
        setTopologyStr={setTopologyStr}
        attackVectors={attackVectors}
        setAttackVectors={setAttackVectors}
        graphNodes={graphNodes}
        setGraphNodes={setGraphNodes}
        graphEdges={graphEdges}
        setGraphEdges={setGraphEdges}
        selectedVecId={selectedVecId}
        setSelectedVecId={setSelectedVecId}
        setSelectedVector={setSelectedVector}
        setActiveView={setActiveView}
      />
    ),
    playbook: (
      <PlaybookWorkspace
        selectedVector={selectedVector}
        setSelectedVector={setSelectedVector}
        incidentDesc={incidentDesc}
        setIncidentDesc={setIncidentDesc}
        playbook={playbook}
        setPlaybook={setPlaybook}
      />
    ),
    redteam: (
      <RedTeamWorkspace
        topology={topology}
        attackChain={attackChain}
        setAttackChain={setAttackChain}
        setActiveView={setActiveView}
      />
    ),
    countermeasures: (
      <CountermeasuresWorkspace
        attackChain={attackChain}
        countermeasures={countermeasures}
        setCountermeasures={setCountermeasures}
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