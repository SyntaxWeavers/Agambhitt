import { useMemo, useState } from 'react'
import { fetchAnalyze } from '../lib/agambhittApi.js'

export function AttackWorkspace({
  topology,
  setTopology,
  topologyStr,
  setTopologyStr,
  attackVectors,
  setAttackVectors,
  graphNodes,
  setGraphNodes,
  graphEdges,
  setGraphEdges,
  selectedVecId,
  setSelectedVecId,
  setSelectedVector,
  setActiveView
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredVector, setHoveredVector] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (!json.nodes || !json.edges) {
          setError('Invalid format. JSON must contain "nodes" and "edges" keys.')
          return
        }
        setTopology(json)
        setTopologyStr(JSON.stringify(json, null, 2))
        setError('')
      } catch (err) {
        setError('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError('')
    try {
      const parsedTopology = JSON.parse(topologyStr)
      setTopology(parsedTopology)

      const result = await fetchAnalyze({
        topology: parsedTopology,
        vulnerabilities: [],
        historical_incidents: [],
      })

      setAttackVectors(result.attack_vectors || [])
      setGraphNodes(result.graph_nodes || [])
      setGraphEdges(result.graph_edges || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate hierarchical positions for nodes based on their tier:
  const nodePositions = useMemo(() => {
    const positions = {}
    const tiers = {}

    // Group nodes by tier
    graphNodes.forEach((node) => {
      const tier = node.tier ?? 2
      if (!tiers[tier]) tiers[tier] = []
      tiers[tier].push(node)
    });

    const svgWidth = 800
    const svgHeight = 400

    // Assign positions
    Object.keys(tiers).forEach((tierStr) => {
      const tier = parseInt(tierStr, 10)
      const nodesInTier = tiers[tier]
      const count = nodesInTier.length

      // X-coord
      const x = 70 + (5 - tier) * 130

      nodesInTier.forEach((node, index) => {
        // Y-coord distributed vertically
        const y = 40 + (index + 0.5) * ((svgHeight - 80) / count)
        positions[node.id] = { x, y, ...node }
      })
    })

    return positions
  }, [graphNodes])

  // Active path node & link sets for highlighting
  const activePathDetails = useMemo(() => {
    const activeVec = hoveredVector ?? attackVectors.find(v => v.vector_id === selectedVecId)
    if (!activeVec) return { nodes: new Set(), edges: new Set() }

    const path = activeVec.path || []
    const nodes = new Set(path)
    const edges = new Set()
    for (let i = 0; i < path.length - 1; i++) {
      edges.add(`${path[i]}➔${path[i+1]}`)
    }

    return { nodes, edges }
  }, [hoveredVector, selectedVecId, attackVectors])

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Attack Predictor</h1>
          <p className="section-subtitle">
            Upload or paste network topology data to predict likely attack paths using granite4.1:3b.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel-grid">
          {/* Topology Input & Upload */}
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Network Topology</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label className="control-chip" style={{ cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  Upload JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button 
                  className="new-simulation" 
                  onClick={handleAnalyze} 
                  disabled={isLoading}
                  style={{ cursor: 'pointer', padding: '0.55rem 0.9rem', width: 'auto' }}
                >
                  {isLoading ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>
            <div className="card-body">
              <label className="small-label">Topology JSON (must contain nodes and edges)</label>
              <textarea
                className="text-editor"
                style={{ minHeight: '26rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
                value={topologyStr}
                onChange={(e) => setTopologyStr(e.target.value)}
              />
              {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem', marginBottom: 0 }}>{error}</p>}
            </div>
          </section>

          {/* Results List */}
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Predicted Attack Vectors</h2>
              <span className="count-pill">{attackVectors.length} Found</span>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: '31rem' }}>
              {attackVectors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>shield</span>
                  <p>No attack vectors predicted yet. Upload a topology JSON (like `to_use.json`) and run analysis.</p>
                </div>
              ) : (
                <div className="vector-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {attackVectors.map((vec, idx) => (
                    <article 
                      key={idx} 
                      className={`vector-card ${selectedVecId === vec.vector_id ? 'selected' : ''}`} 
                      style={{ 
                        borderLeft: selectedVecId === vec.vector_id ? '4px solid #ef4444' : '4px solid var(--danger)',
                        cursor: 'pointer',
                        background: selectedVecId === vec.vector_id ? '#fee2e2' : ''
                      }}
                      onClick={() => setSelectedVecId(vec.vector_id)}
                      onMouseEnter={() => setHoveredVector(vec)}
                      onMouseLeave={() => setHoveredVector(null)}
                    >
                      <div className="vector-header">
                        <h3 className="vector-title app-heading">{vec.name}</h3>
                        <span className="severity-pill critical">{vec.severity}</span>
                      </div>
                      <p className="vector-desc">{vec.description}</p>
                      <div style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
                        <strong>Likelihood:</strong> {vec.likelihood} | <strong>Impact:</strong> {vec.business_impact}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.5rem 0' }}>
                        {vec.mitre_attack_mappings.map(tag => (
                          <span key={tag} className="tag-chip" style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{tag}</span>
                        ))}
                      </div>
                      <div className="vector-meta" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Path: {vec.path.join(' ➔ ')}</span>
                        <button
                          className="control-chip"
                          style={{ marginLeft: 'auto', background: 'var(--bg-soft)', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVector(vec)
                            setActiveView('playbook')
                          }}
                        >
                          Generate Playbook ➔
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Graphical Path Visualization */}
        {graphNodes.length > 0 && (
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Interactive Network Path Visualization</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hover/Click predicted attack vectors to trace path flows
              </div>
            </div>
            <div className="card-body" style={{ background: '#0b1329', display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
              <svg width="100%" height="400" viewBox="0 0 800 400" style={{ maxWidth: '800px' }}>
                {/* Connections / Edges */}
                {graphEdges.map((edge, idx) => {
                  const srcNode = nodePositions[edge.source]
                  const dstNode = nodePositions[edge.target]
                  if (!srcNode || !dstNode) return null

                  const isPathHighlighted = activePathDetails.edges.has(`${edge.source}➔${edge.target}`)

                  return (
                    <g key={idx}>
                      <line
                        x1={srcNode.x}
                        y1={srcNode.y}
                        x2={dstNode.x}
                        y2={dstNode.y}
                        stroke={isPathHighlighted ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}
                        strokeWidth={isPathHighlighted ? 3 : 1.5}
                        strokeDasharray={isPathHighlighted ? '6,6' : 'none'}
                        style={{
                          transition: 'stroke 0.2s, stroke-width 0.2s',
                          animation: isPathHighlighted ? 'dash-move 20s linear infinite' : 'none'
                        }}
                      />
                    </g>
                  )
                })}

                {/* Nodes */}
                {Object.values(nodePositions).map((node) => {
                  const isNodeHighlighted = activePathDetails.nodes.has(node.id)
                  
                  // Color codes
                  let fill = '#38bdf8' // Default (Microservice, Portal)
                  if (node.type === 'DB') fill = '#10b981' // Secure target
                  if (node.type === 'External') fill = '#ef4444' // Aggressor

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r={isNodeHighlighted ? 22 : 18}
                        fill="#0b1329"
                        stroke={isNodeHighlighted ? '#ef4444' : fill}
                        strokeWidth={isNodeHighlighted ? 3 : 2}
                        style={{ transition: 'r 0.2s, stroke 0.2s, stroke-width 0.2s' }}
                      />
                      <text
                        y={32}
                        textAnchor="middle"
                        fill={isNodeHighlighted ? '#ef4444' : '#f8fafc'}
                        style={{
                          fontFamily: 'var(--body-font)',
                          fontSize: '0.75rem',
                          fontWeight: isNodeHighlighted ? 'bold' : 'normal',
                          pointerEvents: 'none'
                        }}
                      >
                        {node.id}
                      </text>
                      <text
                        textAnchor="middle"
                        y={4}
                        fill="#fff"
                        style={{
                          fontFamily: 'Material Symbols Outlined',
                          fontSize: '1rem',
                          pointerEvents: 'none'
                        }}
                      >
                        {node.type === 'DB' ? 'database' : node.type === 'External' ? 'public' : 'dns'}
                      </text>
                    </g>
                  )
                })}
              </svg>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash-move {
                  to {
                    stroke-dashoffset: -1000px;
                  }
                }
              `}} />
            </div>
          </section>
        )}
      </div>
    </section>
  )
}