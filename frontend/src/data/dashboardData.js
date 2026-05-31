export const navigationItems = [
  { view: 'attack', icon: 'insights', label: 'Attack Predictor' },
  { view: 'playbook', icon: 'auto_fix_high', label: 'Playbook Generator' },
  { view: 'redteam', icon: 'security', label: 'Red Team Simulator' },
  { view: 'countermeasures', icon: 'shield', label: 'Defensive Response' },
  { view: 'audit', icon: 'history', label: 'Audit History' },
]

export const supportItems = [
  { icon: 'settings', label: 'Settings' },
  { icon: 'help', label: 'Support' },
]

export const defaultTopology = {
  nodes: [
    { id: "External_C2", type: "External", tier: 5, ip: "185.220.101.5" },
    { id: "AppServer_Portal", type: "AppServer", tier: 2, ip: "10.0.1.46" },
    { id: "MicroService_AuthToken", type: "MicroService", tier: 1, ip: "10.0.2.12" },
    { id: "DB_Core_Banking", type: "DB", tier: 0, ip: "10.0.0.5" }
  ],
  edges: [
    { src: "External_C2", dst: "AppServer_Portal", protocol: "HTTPS", port: 443 },
    { src: "AppServer_Portal", dst: "MicroService_AuthToken", protocol: "gRPC", port: 50051 },
    { src: "MicroService_AuthToken", dst: "DB_Core_Banking", protocol: "SQL", port: 5432 }
  ]
}

export const defaultVulnerabilities = [
  {
    node_id: "AppServer_Portal",
    cve: "CVE-2023-38646",
    severity: "Critical",
    description: "Remote Code Execution vulnerability in portal server"
  },
  {
    node_id: "MicroService_AuthToken",
    cve: "CVE-2024-21626",
    severity: "High",
    description: "Container escape vulnerability allowing privilege escalation"
  }
]

export const defaultIncidents = [
  {
    node_id: "External_C2",
    description: "Port scanning traffic originating from known malicious address",
    timestamp: 1748621400
  }
]