export const navigationItems = [
  { view: 'attack', icon: 'insights', label: 'Attack Predictor' },
  { view: 'playbook', icon: 'auto_fix_high', label: 'Playbook Generator' },
  { view: 'redteam', icon: 'security', label: 'Red Team Simulator' },
  { view: 'audit', icon: 'history', label: 'Audit History' },
]

export const supportItems = [
  { icon: 'settings', label: 'Settings' },
  { icon: 'help', label: 'Support' },
]

export const topologyJson = `{
  "network_assets": [
    { "id": "srv_01", "type": "web_server", "os": "linux", "vuln": ["CVE-2023-1234"] },
    { "id": "db_02", "type": "database", "os": "windows", "vuln": ["CVE-2021-9988"] },
    { "id": "gw_03", "type": "gateway", "os": "cisco", "vuln": [] }
  ],
  "traffic_patterns": [
    { "source": "ext_ip", "target": "srv_01", "port": 443, "freq": "high" },
    { "source": "srv_01", "target": "db_02", "port": 5432, "freq": "low" }
  ]
}`

export const attackVectors = [
  {
    title: 'Credential Escalation via CVE-2023-1234',
    severity: '9.8 Critical',
    tone: 'critical',
    description:
      'Attacker exploits the Linux kernel vulnerability on Web Server 01 to gain root access and dump process memory.',
    path: 'Path: Web -> Database',
    actors: ['W', 'D'],
  },
  {
    title: 'SQL Injection to Remote Shell',
    severity: '8.4 Critical',
    tone: 'critical',
    description:
      'Secondary entry point detected via unsanitized headers on Port 443. High probability of data exfiltration.',
    path: 'Path: External -> Web',
    actors: ['W'],
  },
  {
    title: 'Brute Force Admin Panel',
    severity: '6.2 Medium',
    tone: 'medium',
    description:
      'Detected excessive login attempts on administrative subdomains. Rate limiting recommended.',
    muted: true,
  },
]

export const attackPathNodes = [
  {
    label: 'External Actor',
    icon: 'public',
    tone: 'danger',
  },
  {
    label: 'Web Server 01',
    icon: 'dns',
    tone: 'danger',
  },
  {
    label: 'SQL Database',
    icon: 'database',
    tone: 'primary',
  },
  {
    label: 'Exfiltration',
    icon: 'cloud_download',
    tone: 'muted',
  },
]

export const workspaceHighlights = [
  {
    title: 'Predictive Engine v4.2.0-Stable',
    eyebrow: 'Threat Intelligence',
  },
  {
    title: '3 Critical Vectors',
    eyebrow: 'Current Exposure',
  },
]

export const incidentSteps = {
  containment: [
    'Isolate DB-SRV-01 from VLAN 40 to prevent lateral movement.',
    "Revoke active session tokens for user 'svc_sync_proc'.",
    'Blacklist destination IP 185.122.x.x at the edge firewall.',
  ],
  eradication: [
    'Scan for malicious persistence scripts in /etc/cron.d/.',
    'Rotate root credentials and administrative SSH keys.',
    'Remove unauthorized public key from .ssh/authorized_keys.',
  ],
  recovery: [
    'Restore database configs from last known clean backup (T-2h).',
    'Monitor traffic for 48h for any re-infection signatures.',
    'Re-integrate server to production VLAN after validation.',
  ],
}

export const playbookMetrics = [
  { label: 'Priority', value: 'High' },
  { label: 'Steps', value: '9' },
  { label: 'Confidence', value: '92%' },
]

export const playbookInsights = [
  {
    label: 'Primary Vulnerability',
    value: 'CVE-2024-21887',
    note: 'Command injection in legacy API gateway',
  },
  {
    label: 'Threat Actor',
    value: 'Uncategorized',
    note: 'Suspected APT-41',
  },
  {
    label: 'Data Impact',
    value: 'Low',
    note: 'Intercepted at 0.4 GB',
  },
]

export const redTeamTimeline = [
  {
    phase: 'Reconnaissance',
    time: 'T + 00:00:15',
    attackTitle: 'Port Scanning (Nmap)',
    attackBody: 'Aggressive scan detected on subnet 10.0.1.0/24. Identifying open ports and service versions.',
    defenseTitle: 'IDS Alert: Scan Detected',
    defenseBody: 'Suricata signature 2010935 triggered. IP 192.168.1.45 blacklisted on Edge Firewall.',
    tone: 'primary',
    defenseTone: 'secondary',
  },
  {
    phase: 'Exploitation',
    time: 'T + 00:04:12',
    attackTitle: 'SSH Brute Force Success',
    attackBody: "Credential stuffing attack successful against 'srv-web-01'. Root access obtained via weak password policy.",
    defenseTitle: 'Account Lockout Bypass',
    defenseBody: 'Fail2Ban service was misconfigured. Threat actor bypassed rate-limiting through proxy rotation.',
    tone: 'error',
    defenseTone: 'error',
  },
  {
    phase: 'Ongoing',
    time: 'Live',
    attackTitle: 'Lateral Movement Pending...',
    attackBody: 'Awaiting next trigger...',
    defenseTitle: 'Awaiting Next Trigger...',
    defenseBody: 'Awaiting next trigger...',
    tone: 'outline',
    defenseTone: 'outline',
  },
]

export const redTeamPath = [
  { label: 'Edge Router', icon: 'public', tone: 'primary', status: 'SAFE' },
  { label: 'Web Server', icon: 'dns', tone: 'neutral', status: 'PROBE' },
  { label: 'Infiltrated Node', icon: 'terminal', tone: 'error', status: 'BREACHED' },
  { label: 'SQL DB (Target)', icon: 'database', tone: 'neutral', status: 'TARGET' },
]

export const redTeamMetrics = [
  { label: 'Compromise Risk', value: '84%', tone: 'error' },
  { label: 'Data Integrity', value: '92%', tone: 'secondary' },
]

export const redTeamControls = [
  { label: 'Threat Actor Profile', value: 'APT28 (Fancy Bear)', type: 'select' },
  { label: 'Attack Velocity', value: 'Fast', type: 'range' },
  { label: 'Auto-generate Playbook', value: true, type: 'toggle' },
]

export const redTeamLogLines = [
  { tone: 'secondary-fixed-dim', text: '[14:22:01] Attempting SSH login: root@10.0.1.5' },
  { tone: 'on-error-container', text: '[14:22:04] Access Granted. UID=0(root)' },
  { tone: 'default', text: '[14:22:10] Scanning local networks for SMB shares...' },
  { tone: 'primary-fixed', text: '[14:22:15] Lateral movement target: 10.0.1.12 identified' },
]

export const auditHistoryRows = [
  {
    timestamp: '2023-11-24 14:22:05',
    icon: 'login',
    action: 'User Login: admin_soc_01',
    severity: 'Low',
    severityTone: 'neutral',
    status: 'Success',
    statusTone: 'secondary',
  },
  {
    timestamp: '2023-11-24 14:18:42',
    icon: 'policy',
    action: 'Rule Update: Firewall Egress Block',
    severity: 'High',
    severityTone: 'danger',
    status: 'Deployed',
    statusTone: 'secondary',
  },
  {
    timestamp: '2023-11-24 13:55:10',
    icon: 'database',
    action: 'Database Backup Initiated',
    severity: 'Medium',
    severityTone: 'neutral',
    status: 'In Progress',
    statusTone: 'primary',
  },
  {
    timestamp: '2023-11-24 12:30:15',
    icon: 'report_problem',
    action: 'Unauthorized Access Attempt',
    severity: 'Critical',
    severityTone: 'danger',
    status: 'Blocked',
    statusTone: 'danger',
  },
  {
    timestamp: '2023-11-24 11:45:00',
    icon: 'terminal',
    action: 'Simulation Run: APT-29 Mimicry',
    severity: 'Medium',
    severityTone: 'neutral',
    status: 'Completed',
    statusTone: 'secondary',
  },
  {
    timestamp: '2023-11-24 11:12:33',
    icon: 'person_add',
    action: 'New Analyst Added: j.smith',
    severity: 'Low',
    severityTone: 'neutral',
    status: 'Verified',
    statusTone: 'secondary',
  },
  {
    timestamp: '2023-11-24 10:05:59',
    icon: 'encrypted',
    action: 'Certificate Renewal Failed',
    severity: 'High',
    severityTone: 'danger',
    status: 'Error',
    statusTone: 'danger',
  },
]

export const auditMetrics = [
  { label: 'Active Sessions', value: '12', detail: 'Stable' },
  { label: 'Storage Status', value: '4.2 TB', detail: '82% Full' },
  { label: 'Integrity Check', value: 'Passed', detail: 'Verified' },
  { label: 'Retention Policy', value: '90 Days', detail: 'Standard' },
]