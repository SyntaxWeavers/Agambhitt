import { useEffect, useState } from 'react'
import { auditHistoryRows, auditMetrics } from '../data/dashboardData.js'
import { fetchHistory, normalizeAuditResponse } from '../lib/agambhittApi.js'

function SectionCard({ children, className = '' }) {
  return <section className={`surface-card ${className}`.trim()}>{children}</section>
}

function SeverityBadge({ tone, children }) {
  return <span className={`audit-badge is-${tone}`}>{children}</span>
}

function StatusPill({ tone, children }) {
  return (
    <span className={`audit-status is-${tone}`}>
      <span className={`audit-dot is-${tone}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export function AuditHistoryWorkspace() {
  const [history, setHistory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  async function loadHistory() {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetchHistory()
      setHistory(normalizeAuditResponse(response))
      setSelectedRow(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load audit history.')
      setHistory(null)
      setSelectedRow(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadHistory())
  }, [])

  const rows = history?.rows.length ? history.rows : auditHistoryRows
  const metrics = history?.metrics.length ? history.metrics : auditMetrics
  const detailRow = selectedRow

  return (
    <section className="workspace-section dashboard-content audit-workspace">
      <div className="workspace-title-row audit-header">
        <div>
          <h1 className="section-heading app-heading">Audit History</h1>
          <p className="section-subtitle">
            Comprehensive ledger of all security operations and system changes.
          </p>
        </div>

        <div className="audit-actions">
          <button className="control-chip secondary-chip" type="button" onClick={loadHistory}>
            {isLoading ? 'Loading...' : 'Filter'}
          </button>
          <button className="new-simulation generate-button" type="button">
            Export CSV
            <span className="material-symbols-outlined" aria-hidden="true">download</span>
          </button>
        </div>
      </div>

      {error ? <p className="path-note" style={{ color: '#b91c1c' }}>{error}</p> : null}

      <SectionCard className="audit-table-card">
        <div className="audit-table-shell">
          <table className="audit-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTION</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th className="audit-table-actions">DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="audit-row" key={`${row.timestamp}-${row.action}`}>
                  <td>{row.timestamp}</td>
                  <td>
                    <div className="audit-action-cell">
                      <span className={`material-symbols-outlined audit-row-icon is-${row.severityTone}`} aria-hidden="true">
                        {row.icon}
                      </span>
                      <span>{row.action}</span>
                    </div>
                  </td>
                  <td>
                    <SeverityBadge tone={row.severityTone}>{row.severity}</SeverityBadge>
                  </td>
                  <td>
                    <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
                  </td>
                  <td className="audit-table-actions">
                    <button
                      className="audit-detail-button"
                      type="button"
                      aria-label={`Open ${row.action}`}
                      aria-expanded={selectedRow?.timestamp === row.timestamp && selectedRow?.action === row.action}
                      onClick={() => setSelectedRow((currentRow) => (currentRow?.timestamp === row.timestamp && currentRow?.action === row.action ? null : row))}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        chevron_right
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detailRow ? (
          <div className="audit-detail-panel">
            <div className="audit-detail-head">
              <div>
                <p className="audit-metric-label">Selected Record</p>
                <h3 className="audit-detail-title app-heading">{detailRow.action}</h3>
              </div>

              <button className="audit-page-button" type="button" onClick={() => setSelectedRow(null)}>
                Close
              </button>
            </div>

            <div className="audit-detail-grid">
              <div>
                <p className="audit-metric-label">Timestamp</p>
                <p className="audit-detail-value app-heading">{detailRow.timestamp}</p>
              </div>
              <div>
                <p className="audit-metric-label">Severity</p>
                <SeverityBadge tone={detailRow.severityTone}>{detailRow.severity}</SeverityBadge>
              </div>
              <div>
                <p className="audit-metric-label">Status</p>
                <StatusPill tone={detailRow.statusTone}>{detailRow.status}</StatusPill>
              </div>
            </div>

            <p className="audit-detail-description">
              {detailRow.detail ||
                `No extended details were provided for ${detailRow.action}. The event is still listed in the audit trail with its severity and status.`}
            </p>
          </div>
        ) : null}

        <div className="audit-footer">
          <div className="audit-pagination-copy">
            Showing <strong>1 - 7</strong> of 248 records
          </div>

          <div className="audit-pagination">
            <button className="audit-page-button" type="button" disabled>
              Previous
            </button>
            <div className="audit-pages">
              <button className="audit-page-number is-active" type="button">
                1
              </button>
              <button className="audit-page-number" type="button">
                2
              </button>
              <button className="audit-page-number" type="button">
                3
              </button>
              <span className="audit-ellipsis">...</span>
              <button className="audit-page-number" type="button">
                36
              </button>
            </div>
            <button className="audit-page-button" type="button">
              Next
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="audit-metrics-grid">
        {metrics.map((metric) => (
          <SectionCard key={metric.label} className="audit-metric-card">
            <p className="audit-metric-label">{metric.label}</p>
            <div className="audit-metric-value-row">
              <span className="audit-metric-value app-heading">{metric.value}</span>
              <span className="audit-metric-detail">{metric.detail}</span>
            </div>
          </SectionCard>
        ))}
      </div>
    </section>
  )
}