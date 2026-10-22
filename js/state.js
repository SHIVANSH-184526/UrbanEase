/* UrbanEase Database Simulation (js/state.js) */

const STORAGE_PREFIX = 'urbanease_';

// Rule-Based Transparent AI Priority Classification Engine Simulation
export function calculateAIPriority(category, title, description, address = '') {
  const text = `${title} ${description} ${address}`.toLowerCase();
  
  // Base Risk Scores by Category
  let baseScore = 40;
  let categoryName = 'General Issue';

  switch (category) {
    case 'broken-traffic-signal':
      baseScore = 75;
      categoryName = 'Broken Traffic Signal';
      break;
    case 'water-leakage':
      baseScore = 65;
      categoryName = 'Water Leakage / Pipe Burst';
      break;
    case 'pothole':
      baseScore = 60;
      categoryName = 'Pothole';
      break;
    case 'road-damage':
      baseScore = 55;
      categoryName = 'Road Damage';
      break;
    case 'accessibility-issue':
      baseScore = 55;
      categoryName = 'Accessibility Issue';
      break;
    case 'footpath-obstruction':
      baseScore = 45;
      categoryName = 'Footpath Obstruction';
      break;
    case 'streetlight-problem':
      baseScore = 40;
      categoryName = 'Streetlight Problem';
      break;
    case 'garbage-waste':
      baseScore = 35;
      categoryName = 'Garbage / Waste';
      break;
    default:
      baseScore = 30;
      categoryName = 'Other Infrastructure Issue';
      break;
  }

  let bonusScore = 0;
  let reasonFactors = [];

  // High Pedestrian & Vulnerable Zone Keywords
  if (/school|hospital|kindergarten|clinic|nursing|elderly|wheelchair|blind|disabled|pedestrian/i.test(text)) {
    bonusScore += 18;
    reasonFactors.push('located near a high pedestrian / sensitive vulnerable zone');
  }

  // Heavy Traffic & Core Corridor Keywords
  if (/junction|intersection|metro|station|main road|highway|expressway|commercial|bus stop|market/i.test(text)) {
    bonusScore += 12;
    reasonFactors.push('situated along a major urban transit corridor');
  }

  // Critical Safety Hazard Keywords
  if (/danger|hazard|severe|burst|flooding|collapse|accident|deep|veered|stuck|dark|night/i.test(text)) {
    bonusScore += 15;
    reasonFactors.push('exhibits acute physical hazard characteristics');
  }

  let finalScore = Math.min(98, Math.max(12, baseScore + bonusScore));
  
  let priority = 'medium';
  if (finalScore >= 80) priority = 'critical';
  else if (finalScore >= 62) priority = 'high';
  else if (finalScore >= 38) priority = 'medium';
  else priority = 'low';

  let reason = `${categoryName} issue`;
  if (reasonFactors.length > 0) {
    reason += ` ${reasonFactors.join(' and ')}. Calculated by rule-based risk analysis engine.`;
  } else {
    reason += ` evaluated under standard municipal priority guidelines.`;
  }

  return {
    category,
    categoryName,
    priority,
    riskScore: finalScore,
    reason
  };
}

// Seed Versioning Migration (Ensures existing localStorage updates to Mumbai seamlessly)
const SCHEMA_VERSION = 'v2_mumbai';

// Default Seed Users
const DEFAULT_USERS = [
  {
    username: 'admin',
    name: 'Director General',
    email: 'admin@urbanease.gov.in',
    password: 'admin',
    role: 'admin',
    status: 'active',
    registeredAt: '2026-07-01T09:00:00Z',
    reputationScore: 100,
    activityLogs: [
      { action: 'Admin initialized prototype system', time: '2026-07-01T09:00:00Z' }
    ]
  },
  {
    username: 'citizen',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    password: 'citizen',
    role: 'citizen',
    status: 'active',
    registeredAt: '2026-07-10T11:24:00Z',
    reputationScore: 85,
    notifications: [
      { id: 'notif-1', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been verified by municipal operators.', date: '2026-07-12T09:00:00Z', read: true },
      { id: 'notif-2', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been assigned to Municipal Works Division.', date: '2026-07-12T10:12:00Z', read: true },
      { id: 'notif-3', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been successfully resolved!', date: '2026-07-14T16:45:00Z', read: false }
    ],
    activityLogs: [
      { action: 'Registered user account', time: '2026-07-10T11:24:00Z' },
      { action: 'Logged in to dashboard', time: '2026-07-20T14:30:00Z' }
    ]
  },
  {
    username: 'priya_k',
    name: 'Priya Krishnan',
    email: 'priya.k@outlook.com',
    password: 'user123',
    role: 'citizen',
    status: 'pending',
    registeredAt: '2026-07-20T08:15:00Z',
    reputationScore: 50,
    notifications: [],
    activityLogs: [
      { action: 'Registered user account, waiting for approval', time: '2026-07-20T08:15:00Z' }
    ]
  },
  {
    username: 'spammer_bob',
    name: 'Bob Miller',
    email: 'bob.spam@junkmail.com',
    password: 'password123',
    role: 'citizen',
    status: 'suspended',
    registeredAt: '2026-07-15T18:40:00Z',
    reputationScore: 5,
    notifications: [],
    activityLogs: [
      { action: 'Registered user account', time: '2026-07-15T18:40:00Z' },
      { action: 'Account suspended due to fake report detection', time: '2026-07-18T10:00:00Z' }
    ]
  }
];

// Default Seed Complaints (Mumbai region across Western, Central & Harbour corridors)
const DEFAULT_COMPLAINTS = [
  {
    id: 'UE-2026-00124',
    title: 'Severe Pothole on Western Express Highway near Bandra Flyover',
    description: 'A deep pothole has formed in the middle lane of the Western Express Highway right after the Bandra flyover descent. Heavy risk for two-wheelers and morning office traffic heading towards BKC and South Mumbai.',
    category: 'pothole',
    severity: 'high',
    priority: 'high',
    riskScore: 87,
    priorityReason: 'Pothole issue located near a high pedestrian / sensitive vulnerable zone and situated along a major urban transit corridor. Calculated by rule-based risk analysis engine.',
    status: 'resolved',
    lat: 19.0590,
    lng: 72.8420,
    address: 'Western Express Highway, Bandra East, H/East Ward, Mumbai',
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    resolutionImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=600&auto=format&fit=crop',
    resolutionRemarks: 'Municipal road repair crew dispatched. Asphalt resurfaced, compacted, and sealed. Highway lane reopened to traffic safely.',
    resolvedAt: '2026-07-14T16:45:00Z',
    reporter: 'citizen',
    contactInfo: { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210' },
    supports: 12,
    supportedBy: ['citizen', 'priya_k'],
    department: 'Municipal Works Division',
    comments: [
      { author: 'admin', comment: 'Complaint verified by municipal inspector. Status changed to Verified.', date: '2026-07-12T09:00:00Z' },
      { author: 'admin', comment: 'Assigned to Bandra highway maintenance crew. Status changed to Assigned.', date: '2026-07-12T10:12:00Z' },
      { author: 'admin', comment: 'Work crew on site laying cold-mix asphalt patching.', date: '2026-07-13T11:30:00Z' },
      { author: 'admin', comment: 'Pothole filled and sealed. Road inspected. Resolving case.', date: '2026-07-14T16:45:00Z' }
    ],
    feedback: {
      rating: 5,
      comment: 'Issue was resolved satisfactorily within 48 hours. Excellent response on the Western Express Highway!',
      submittedAt: '2026-07-15T08:20:00Z'
    },
    date: '2026-07-11T14:35:00Z'
  },
  {
    id: 'UE-2026-00125',
    title: 'Damaged Wheelchair Ramp at Dadar Station Central-Western Interchange',
    description: 'The tactile ramp leading to the central foot overbridge connecting Western and Central Lines at Dadar is cracked and broken, making it impassable for wheelchairs and commuters with mobility aids.',
    category: 'accessibility-issue',
    severity: 'high',
    priority: 'critical',
    riskScore: 91,
    priorityReason: 'Accessibility Issue located near a high pedestrian / sensitive vulnerable zone and situated along a major urban transit corridor. Calculated by rule-based risk analysis engine.',
    status: 'in-progress',
    lat: 19.0180,
    lng: 72.8480,
    address: 'Platform 1-2 Passage, Dadar Station Interchange, G/North Ward, Mumbai',
    image: 'https://images.unsplash.com/photo-1598048145816-43ad3712b7a9?q=80&w=600&auto=format&fit=crop',
    resolutionImage: '',
    resolutionRemarks: '',
    resolvedAt: '',
    reporter: 'citizen',
    contactInfo: { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210' },
    supports: 8,
    supportedBy: ['citizen'],
    department: 'Metro Accessibility Unit',
    comments: [
      { author: 'admin', comment: 'Verified accessibility gap at Dadar interchange. Assigned to Accessibility Engineering Unit.', date: '2026-07-19T09:20:00Z' },
      { author: 'admin', comment: 'Contractors erecting temporary ramp while permanent concrete slab is cured.', date: '2026-07-20T10:00:00Z' }
    ],
    feedback: null,
    date: '2026-07-18T11:05:00Z'
  },
  {
    id: 'UE-2026-00126',
    title: 'Garbage Dump Blockade on LBS Marg Footpath near Kurla Station',
    description: 'Commercial debris and overflowing waste bins dumped on the pedestrian walkway near Kurla West station entrance, pushing commuters onto oncoming heavy bus lanes.',
    category: 'garbage-waste',
    severity: 'medium',
    priority: 'medium',
    riskScore: 59,
    priorityReason: 'Garbage / Waste issue situated along a major urban transit corridor. Calculated by rule-based risk analysis engine.',
    status: 'under-review',
    lat: 19.0665,
    lng: 72.8785,
    address: 'LBS Marg, Near Kurla West Station Entrance, L Ward, Mumbai',
    image: '',
    resolutionImage: '',
    resolutionRemarks: '',
    resolvedAt: '',
    reporter: 'citizen',
    contactInfo: { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '' },
    supports: 3,
    supportedBy: [],
    department: 'Solid Waste Management',
    comments: [
      { author: 'admin', comment: 'Under review by L Ward sanitation inspection unit.', date: '2026-07-20T09:00:00Z' }
    ],
    feedback: null,
    date: '2026-07-20T08:30:00Z'
  },
  {
    id: 'UE-2026-00127',
    title: 'Streetlight Failure along Wadala Harbour Line Flyover Walkway',
    description: 'A row of four LED streetlights is unlit on the pedestrian walkway approaching Wadala Road station. Creates hazardous dark spots for evening commuters on the Harbour Line.',
    category: 'streetlight-problem',
    severity: 'medium',
    priority: 'medium',
    riskScore: 52,
    priorityReason: 'Streetlight Problem issue exhibits acute physical hazard characteristics. Calculated by rule-based risk analysis engine.',
    status: 'submitted',
    lat: 19.0170,
    lng: 72.8590,
    address: 'Harbour Line Approach Rd, Wadala East, F/North Ward, Mumbai',
    image: '',
    resolutionImage: '',
    resolutionRemarks: '',
    resolvedAt: '',
    reporter: 'citizen',
    contactInfo: { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '' },
    supports: 1,
    supportedBy: [],
    department: 'City Power & Lighting Dept',
    comments: [],
    feedback: null,
    date: '2026-07-20T17:15:00Z'
  },
  {
    id: 'UE-2026-00128',
    title: 'Broken Traffic Signal at Andheri SV Road & Gokhale Bridge Junction',
    description: 'The traffic signal at the SV Road intersection near Andheri station is stuck on blinking red for over 2 hours, resulting in gridlock blocking emergency ambulances.',
    category: 'broken-traffic-signal',
    severity: 'high',
    priority: 'critical',
    riskScore: 94,
    priorityReason: 'Broken Traffic Signal issue located near a high pedestrian / sensitive vulnerable zone and situated along a major urban transit corridor. Calculated by rule-based risk analysis engine.',
    status: 'assigned',
    lat: 19.1190,
    lng: 72.8460,
    address: 'SV Road & Gokhale Bridge Junction, Andheri West, K/West Ward, Mumbai',
    image: '',
    resolutionImage: '',
    resolutionRemarks: '',
    resolvedAt: '',
    reporter: 'citizen',
    contactInfo: { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210' },
    supports: 5,
    supportedBy: [],
    department: 'Traffic Management Directorate',
    comments: [
      { author: 'admin', comment: 'Assigned Mumbai Traffic Police electrical team. Signal control box manual override engaged.', date: '2026-07-20T21:00:00Z' }
    ],
    feedback: null,
    date: '2026-07-20T20:45:00Z'
  }
];

const DEFAULT_PARKING = [
  { id: 'PK-001', name: 'CSMT Multi-Level Public Parking', lat: 18.9415, lng: 72.8360, address: 'Opp. CSMT Station, Fort, South Mumbai', capacity: 350, occupied: 260, charges: '₹60/hr', accessible: true },
  { id: 'PK-002', name: 'BKC Multilevel Automated Car Park', lat: 19.0665, lng: 72.8670, address: 'G Block, Bandra Kurla Complex', capacity: 500, occupied: 310, charges: '₹50/hr', accessible: true },
  { id: 'PK-003', name: 'Dadar Commercial Parking Lot', lat: 19.0190, lng: 72.8440, address: 'Senapati Bapat Marg, Dadar West', capacity: 160, occupied: 145, charges: '₹40/hr', accessible: false },
  { id: 'PK-004', name: 'Andheri Station West Commercial Parking', lat: 19.1205, lng: 72.8445, address: 'SV Road, Andheri West', capacity: 200, occupied: 112, charges: '₹40/hr', accessible: true },
  { id: 'PK-005', name: 'Wadala Monorail Transit Parking', lat: 19.0175, lng: 72.8595, address: 'Near Wadala Bridge, Harbour Corridor', capacity: 180, occupied: 65, charges: '₹30/hr', accessible: true },
  { id: 'PK-006', name: 'Thane Station East Smart Parking', lat: 19.1850, lng: 72.9770, address: 'Kopri Road, Thane East', capacity: 250, occupied: 195, charges: '₹30/hr', accessible: true }
];

const DEFAULT_STATIONS = [
  // Western Line
  { id: 'ST-001', name: 'Churchgate Railway Station', type: 'railway', lat: 18.9322, lng: 72.8264, address: 'Maharshi Karve Road, Churchgate', routes: ['Western Line (Fast & Slow Terminus)'], timetable: ['Every 3-4 mins (04:15 - 01:40)'], accessible: true },
  { id: 'ST-002', name: 'Dadar Junction (Western & Central)', type: 'railway', lat: 19.0178, lng: 72.8478, address: 'Dadar West / East Junction', routes: ['Western Line', 'Central Main Line Interchange'], timetable: ['Every 2-3 mins interchange service'], accessible: true },
  { id: 'ST-003', name: 'Bandra Station & Terminus', type: 'railway', lat: 19.0550, lng: 72.8402, address: 'Station Road, Bandra West/East', routes: ['Western Line', 'Harbour Line Link'], timetable: ['Every 3-5 mins'], accessible: true },
  { id: 'ST-004', name: 'Andheri Integrated Hub', type: 'metro', lat: 19.1197, lng: 72.8464, address: 'SV Road, Andheri West', routes: ['Western Line', 'Metro Line 1 (Versova-Ghatkopar)'], timetable: ['Every 3 mins (05:30 - 23:50)'], accessible: true },
  { id: 'ST-005', name: 'Borivali Suburban Terminal', type: 'railway', lat: 19.2288, lng: 72.8541, address: 'SV Road, Borivali West', routes: ['Western Line (Fast / Slow / AC Suburban)'], timetable: ['Every 3 mins (04:00 - 01:30)'], accessible: true },

  // Central Line
  { id: 'ST-006', name: 'CSMT (Chhatrapati Shivaji Maharaj Terminus)', type: 'railway', lat: 18.9398, lng: 72.8355, address: 'Fort, South Mumbai', routes: ['Central Main Line', 'Harbour Line Terminus'], timetable: ['Every 3 mins (24x7 Commuter Peak)'], accessible: true },
  { id: 'ST-007', name: 'Kurla Junction (Central & Harbour)', type: 'railway', lat: 19.0657, lng: 72.8797, address: 'SG Barve Marg, Kurla West/East', routes: ['Central Main Line', 'Harbour Line Interchange'], timetable: ['Every 3 mins interchange service'], accessible: true },
  { id: 'ST-008', name: 'Ghatkopar Station & Metro Hub', type: 'metro', lat: 19.0860, lng: 72.9080, address: 'LBS Marg, Ghatkopar West', routes: ['Central Main Line', 'Metro Line 1 Terminal'], timetable: ['Every 3 mins (05:30 - 23:45)'], accessible: true },
  { id: 'ST-009', name: 'Thane Central Railway Station', type: 'railway', lat: 19.1860, lng: 72.9759, address: 'Gokhale Road, Thane West', routes: ['Central Main Line', 'Trans-Harbour Line'], timetable: ['Every 3 mins'], accessible: true },

  // Harbour Line
  { id: 'ST-010', name: 'Wadala Road Station', type: 'railway', lat: 19.0166, lng: 72.8586, address: 'Wadala Station Road, Wadala East', routes: ['Harbour Line (Panvel-CSMT / Goregaon)', 'Mumbai Monorail'], timetable: ['Every 4-5 mins'], accessible: true },
  { id: 'ST-011', name: 'Chembur Station & Monorail Hub', type: 'railway', lat: 19.0622, lng: 72.8995, address: 'Station Road, Chembur', routes: ['Harbour Line', 'Monorail Line 1'], timetable: ['Every 5 mins'], accessible: true },
  { id: 'ST-012', name: 'Vashi Station (Navi Mumbai)', type: 'railway', lat: 19.0771, lng: 72.9986, address: 'Sector 30A, Vashi, Navi Mumbai', routes: ['Harbour Line', 'Trans-Harbour Corridor'], timetable: ['Every 4-6 mins'], accessible: true },

  // Key Bus Hubs
  { id: 'ST-013', name: 'BKC Bus Station & E-Mobility Hub', type: 'bus', lat: 19.0657, lng: 72.8687, address: 'G Block, Bandra Kurla Complex', routes: ['BEST AC Electric Buses', 'BKC Feeder Lines'], timetable: ['Every 5 mins peak'], accessible: true }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: 'Accessibility Audit Completed for Western & Central Railway Stations', content: 'Our municipal team together with railway authorities has audited 24 key stations on the Western, Central, and Harbour lines, completing modern ramp access, tactile tiles, and escalators.', date: '2026-07-18T10:00:00Z', author: 'Director General' },
  { id: 2, title: 'Sunday Mega-Block Notice on Central & Harbour Corridors', content: 'Special suburban traffic management in place for overhead wire inspection between Kurla and Vashi on the Harbour Line. Please plan multi-modal road transit accordingly.', date: '2026-07-20T07:00:00Z', author: 'Traffic Directorate' }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 1, action: 'System Setup & Mumbai Seed Data Load', target: 'Database', timestamp: '2026-07-20T10:00:00Z', adminName: 'Director General' },
  { id: 2, action: 'Suspended user spammer_bob due to repeated fake alerts', target: 'spammer_bob', timestamp: '2026-07-20T11:30:00Z', adminName: 'Director General' }
];

// Helper to fetch or initialize localStorage
function getStore(key, defaultValue) {
  // Check schema version migration
  if (localStorage.getItem(STORAGE_PREFIX + 'schema_version') !== SCHEMA_VERSION) {
    localStorage.setItem(STORAGE_PREFIX + 'schema_version', SCHEMA_VERSION);
    localStorage.setItem(STORAGE_PREFIX + 'complaints', JSON.stringify(DEFAULT_COMPLAINTS));
    localStorage.setItem(STORAGE_PREFIX + 'parking', JSON.stringify(DEFAULT_PARKING));
    localStorage.setItem(STORAGE_PREFIX + 'stations', JSON.stringify(DEFAULT_STATIONS));
    localStorage.setItem(STORAGE_PREFIX + 'announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  }
  let data = localStorage.getItem(STORAGE_PREFIX + key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].lat && parsed[0].lat < 15) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (e) {}
  }
  if (data === null) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

function setStore(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

// Exportable State Object
export const DB = {
  // Collections
  getUsers() { return getStore('users', DEFAULT_USERS); },
  setUsers(users) { setStore('users', users); },
  
  getComplaints() { return getStore('complaints', DEFAULT_COMPLAINTS); },
  setComplaints(complaints) { setStore('complaints', complaints); },
  
  getParking() { return getStore('parking', DEFAULT_PARKING); },
  setParking(parking) { setStore('parking', parking); },
  
  getStations() { return getStore('stations', DEFAULT_STATIONS); },
  setStations(stations) { setStore('stations', stations); },
  
  getAnnouncements() { return getStore('announcements', DEFAULT_ANNOUNCEMENTS); },
  setAnnouncements(announcements) { setStore('announcements', announcements); },
  
  getAuditLogs() { return getStore('audit_logs', DEFAULT_AUDIT_LOGS); },
  setAuditLogs(logs) { setStore('audit_logs', logs); },

  // System Configurations
  getSystemSettings() {
    return getStore('settings', {
      approvalWorkflowEnabled: true,
      automaticFakeDetection: true,
      minReputationForUrgent: 40
    });
  },
  setSystemSettings(settings) { setStore('settings', settings); },

  // Global Session
  getCurrentUser() {
    const user = sessionStorage.getItem(STORAGE_PREFIX + 'session');
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_PREFIX + 'session');
    }
  },

  // State Modification Operations
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  },

  updateUser(username, updatedFields) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === username);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      this.setUsers(users);
      
      const current = this.getCurrentUser();
      if (current && current.username === username) {
        this.setCurrentUser({ ...current, ...updatedFields });
      }
      return true;
    }
    return false;
  },

  deleteUser(username) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.username !== username);
    if (users.length !== filtered.length) {
      this.setUsers(filtered);
      return true;
    }
    return false;
  },

  addComplaint(complaint) {
    const complaints = this.getComplaints();
    complaints.unshift(complaint);
    this.setComplaints(complaints);
  },

  updateComplaint(id, updatedFields) {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldComplaint = complaints[index];
      const newComplaint = { ...oldComplaint, ...updatedFields };
      complaints[index] = newComplaint;
      this.setComplaints(complaints);

      // Trigger automatic notification if status updated
      if (updatedFields.status && updatedFields.status !== oldComplaint.status) {
        this.sendNotificationForStatus(newComplaint);
      }

      return true;
    }
    return false;
  },

  sendNotificationForStatus(complaint) {
    const reporter = complaint.reporter;
    const users = this.getUsers();
    const targetUser = users.find(u => u.username === reporter);
    if (!targetUser) return;

    let message = `Your complaint ${complaint.id} status is now "${complaint.status}".`;
    if (complaint.status === 'verified') {
      message = `Your complaint ${complaint.id} has been verified by municipal operators.`;
    } else if (complaint.status === 'assigned') {
      message = `Your complaint ${complaint.id} has been assigned to ${complaint.department || 'the relevant department'}.`;
    } else if (complaint.status === 'in-progress') {
      message = `Your complaint ${complaint.id} is currently being resolved by site crews.`;
    } else if (complaint.status === 'resolved') {
      message = `Your complaint ${complaint.id} has been successfully resolved! You can now view resolution proof and provide feedback.`;
    }

    const notifObj = {
      id: `notif-${Date.now()}`,
      complaintId: complaint.id,
      message,
      date: new Date().toISOString(),
      read: false
    };

    const userNotifs = targetUser.notifications || [];
    userNotifs.unshift(notifObj);
    this.updateUser(reporter, { notifications: userNotifs });
  },

  addAnnouncement(announcement) {
    const list = this.getAnnouncements();
    announcement.id = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
    list.unshift(announcement);
    this.setAnnouncements(list);
  },

  addAuditLog(adminName, action, target) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      adminName,
      action,
      target,
      timestamp: new Date().toISOString()
    });
    this.setAuditLogs(logs);
  },

  resetDatabase() {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'complaints');
    localStorage.removeItem(STORAGE_PREFIX + 'parking');
    localStorage.removeItem(STORAGE_PREFIX + 'stations');
    localStorage.removeItem(STORAGE_PREFIX + 'announcements');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'settings');
    this.setCurrentUser(null);
    window.location.reload();
  }
};
