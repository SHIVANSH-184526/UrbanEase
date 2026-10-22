import { DB } from './state.js';
import { Auth } from './auth.js';
import { RenderMapPage, cleanupMap } from './map.js';
import { RenderUserDashboard } from './dashboard.js';
import { RenderAdminDashboard } from './admin.js';
import { RenderComplaintsPortal, RenderComplaintTrackerPage, cleanupMiniMap } from './complaints.js';
import { RenderStaticPage } from './pages.js';

// Global Toast System
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <div class="toast-content">${message}</div>
    <i data-lucide="x" class="toast-close"></i>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => toast.classList.add('show'), 50);

  let autoTimer = setTimeout(() => removeToast(toast), duration);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoTimer);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.classList.remove('show');
  toast.addEventListener('transitionend', () => toast.remove());
}

// Global Loader
export function setLoader(visible) {
  const outlet = document.getElementById('router-outlet');
  if (!outlet) return;
  
  if (visible) {
    outlet.innerHTML = `
      <div class="page-loader">
        <div class="spinner"></div>
      </div>
    `;
  }
}

// SPA Router
class Router {
  constructor() {
    this.routes = {
      '': () => this.renderHome(),
      '/': () => this.renderHome(),
      '/track': (params) => RenderComplaintTrackerPage(params.get('id') || ''),
      '/features': () => RenderStaticPage('features'),
      '/vision': () => RenderStaticPage('vision'),
      '/faq': () => RenderStaticPage('faq'),
      '/about': () => RenderStaticPage('about'),
      '/contact': () => RenderStaticPage('contact'),
      '/feedback': () => RenderStaticPage('feedback'),
      '/privacy-policy': () => RenderStaticPage('privacy-policy'),
      '/terms': () => RenderStaticPage('terms'),
      
      // Auth Routes
      '/login': () => Auth.renderUserLogin(),
      '/register': () => Auth.renderUserRegister(),
      '/admin-login': () => Auth.renderAdminLogin(),
      '/forgot-password': () => Auth.renderForgotPassword(),
      '/profile': () => this.protectedRoute((user) => Auth.renderProfile(user), 'citizen'),
      
      // Portal Routes
      '/dashboard': () => this.protectedRoute(RenderUserDashboard, 'citizen'),
      '/map': () => {
        cleanupHomeMap();
        cleanupMap();
        const user = DB.getCurrentUser() || { name: 'Guest Citizen', role: 'guest', reputationScore: 80 };
        RenderMapPage(user);
      },
      '/complaints': () => this.protectedRoute(RenderComplaintsPortal, 'citizen'),
      
      // Admin Routes
      '/admin': () => this.protectedRoute(RenderAdminDashboard, 'admin')
    };

    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('DOMContentLoaded', () => {
      this.initTheme();
      this.handleRouting();
      this.setupHeaderActions();
      this.setupMobileMenu();
    });
  }

  handleRouting() {
    cleanupHomeMap();
    cleanupMap();
    cleanupMiniMap();
    let rawHash = window.location.hash;
    let fullPath = rawHash.replace('#', '') || '/';
    
    // Extract query string if present
    const queryIndex = fullPath.indexOf('?');
    let path = fullPath;
    let queryString = '';
    if (queryIndex !== -1) {
      path = fullPath.substring(0, queryIndex);
      queryString = fullPath.substring(queryIndex + 1);
    }
    const params = new URLSearchParams(queryString);

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update Header Active Links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '') || '/';
      if (path === href || (path.startsWith(href) && href !== '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Handle mobile nav items active states
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href').replace('#', '') || '/';
      if (path === href) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.updateHeaderSession();

    // Route matching
    const routeHandler = this.routes[path];
    const renderFn = routeHandler ? () => routeHandler(params) : () => this.render404();
    setLoader(true);
    
    setTimeout(() => {
      try {
        renderFn();
      } catch (err) {
        console.error('Routing Render Error:', err);
        this.render500(err.message);
      }
    }, 150);
  }

  // Middleware/Route Guards
  protectedRoute(renderCallback, requiredRole) {
    const user = DB.getCurrentUser();
    
    if (!user) {
      showToast('Authentication required. Please sign in.', 'warning');
      if (requiredRole === 'admin') {
        window.location.hash = '#/admin-login';
      } else {
        window.location.hash = '#/login';
      }
      return;
    }

    if (user.status === 'suspended') {
      showToast('Your account is suspended. Access denied.', 'error');
      DB.setCurrentUser(null);
      window.location.hash = '#/login';
      return;
    }

    if (user.status === 'pending') {
      showToast('Your registration is pending administrator approval.', 'warning');
      DB.setCurrentUser(null);
      window.location.hash = '#/login';
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      showToast('Unauthorized access.', 'error');
      window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
      return;
    }

    // Pass session data to renderer
    renderCallback(user);
  }

  // Header dynamic updating
  updateHeaderSession() {
    const btnContainer = document.getElementById('auth-header-btn');
    if (!btnContainer) return;

    const user = DB.getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        btnContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <a href="#/admin" class="btn btn-primary btn-sm"><i data-lucide="layout-dashboard"></i> Admin Panel</a>
            <button id="logout-btn" class="btn btn-outline btn-sm">Log Out</button>
          </div>
        `;
      } else {
        btnContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <a href="#/dashboard" class="btn btn-primary btn-sm"><i data-lucide="layout-dashboard"></i> Dashboard</a>
            <a href="#/profile" class="btn btn-outline btn-icon" title="View Profile"><i data-lucide="user"></i></a>
            <button id="logout-btn" class="btn btn-outline btn-sm">Log Out</button>
          </div>
        `;
      }
      
      // Bind logout action
      document.getElementById('logout-btn').addEventListener('click', () => {
        DB.setCurrentUser(null);
        showToast('Logged out successfully.', 'success');
        window.location.hash = '#/login';
      });
    } else {
      btnContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <a href="#/login" class="btn btn-outline btn-sm">Sign In</a>
          <a href="#/register" class="btn btn-primary btn-sm">Register</a>
        </div>
      `;
    }
    lucide.createIcons();
  }

  setupHeaderActions() {
    // Theme Toggler
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled.`, 'info');
      });
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  setupMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
      const handleResize = () => {
        if (window.innerWidth <= 600) {
          mobileNav.classList.remove('hidden');
        } else {
          mobileNav.classList.add('hidden');
        }
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial execution
    }
  }

  renderHome() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <section class="hero-section">
        <span class="hero-tag">Smart City Smart Portal</span>
        <h1 class="hero-title">Transforming Urban Mobility & Accessibility for All Citizens</h1>
        <p class="hero-subtitle">Experience a connected, barrier-free smart environment in Mumbai. Discover optimal travel routes, track Western, Central & Harbour suburban transit, locate parking, and report local accessibility issues to the Municipal Corporation instantly.</p>
        <div class="hero-actions">
          <a href="#/map" class="btn btn-primary btn-lg"><i data-lucide="map"></i> Explore Mumbai Smart Map</a>
          <a href="#/track" class="btn btn-outline btn-lg"><i data-lucide="search"></i> Track Complaint</a>
        </div>
      </section>

      <!-- Live Interactive Mumbai Smart Map Section directly on Home -->
      <section style="padding: 3rem 2rem 1rem 2rem; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 1.5rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <span class="hero-tag"><i data-lucide="map-pin" style="width:12px; height:12px;"></i> Mumbai Region Transit Network</span>
            <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin-top: 0.5rem;">Interactive Mumbai Smart Mobility Map</h2>
            <p style="color: var(--text-secondary); margin-top: 0.3rem;">Real-time GIS overview covering the Western Line, Central Line, Harbour Line, Metro 1, accessible stations, hospitals, parking, and active complaints across Mumbai.</p>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <a href="#/map" class="btn btn-primary"><i data-lucide="route"></i> Open Route Planner</a>
            <a href="#/complaints" class="btn btn-outline"><i data-lucide="plus-circle"></i> File Complaint</a>
          </div>
        </div>
        
        <div class="glass" style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid var(--border-color); position:relative;">
          <div id="home-map" style="height: 500px; width: 100%; z-index: 1;"></div>
          
          <!-- Legend pill overlay -->
          <div style="position:absolute; bottom:15px; left:15px; z-index:1000; background:var(--card-bg); padding:0.6rem 1rem; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 4px 15px rgba(0,0,0,0.15); display:flex; gap:1rem; align-items:center; flex-wrap:wrap; font-size:0.75rem; font-weight:600;">
            <span style="display:flex; align-items:center; gap:0.3rem;"><span style="display:inline-block; width:14px; height:4px; background:#dc2626; border-radius:2px;"></span> Western Line</span>
            <span style="display:flex; align-items:center; gap:0.3rem;"><span style="display:inline-block; width:14px; height:4px; background:#2563eb; border-radius:2px;"></span> Central Line</span>
            <span style="display:flex; align-items:center; gap:0.3rem;"><span style="display:inline-block; width:14px; height:4px; background:#16a34a; border-radius:2px;"></span> Harbour Line</span>
            <span style="display:flex; align-items:center; gap:0.3rem;"><span style="display:inline-block; width:14px; height:4px; background:#9333ea; border-radius:2px;"></span> Metro Line 1</span>
          </div>
        </div>
      </section>

      <section style="padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 3rem; background-color: var(--bg-secondary);">
        <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; text-align: center;">Smart Portals & Modules</h2>
        
        <div class="cards-grid">
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="map"></i></div>
            <h3 class="feature-card-title">Interactive Mumbai Smart Map</h3>
            <p class="feature-card-desc">Navigate Mumbai with live markers pointing to local hospitals, suburban rail lines, accessible paths, parking slots, and road blockages.</p>
            <a href="#/map" class="btn btn-primary mt-auto" style="width:fit-content;">Launch Mumbai Map &rarr;</a>
          </div>
          
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="route"></i></div>
            <h3 class="feature-card-title">Multi-Modal Route Planner</h3>
            <p class="feature-card-desc">Input source and destinations across Western, Central, and Harbour lines to compute custom routes tailored for wheelchairs, cyclists, or emergency runs.</p>
            <a href="#/map" class="btn btn-outline mt-auto" style="width:fit-content;">Plan Route &rarr;</a>
          </div>
          
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="alert-triangle"></i></div>
            <h3 class="feature-card-title">Verified Citizen Complaints</h3>
            <p class="feature-card-desc">File complaints on street issues like potholes or streetlight failures. Features GPS matching, duplication checks, and community verification scorecards.</p>
            <a href="#/complaints" class="btn btn-outline mt-auto" style="width:fit-content;">Submit Complaint &rarr;</a>
          </div>
        </div>
      </section>

      <section style="padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
        <div>
          <span style="color: var(--primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Smart City Vision</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin: 0.8rem 0 1.2rem 0; line-height: 1.2;">Zero Accessibility Barriers & Safe Travel</h2>
          <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 1.5rem;">
            UrbanEase connects the physical infrastructure of the municipality with the digital needs of every citizen. The platform ensures that parents with strollers, disabled commuters, elderly citizens, and emergency response vehicles have immediate visual map data on what routes are safest and fully accessible across the Mumbai Metropolitan Region.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div style="display:flex; gap: 0.6rem; align-items:flex-start;">
              <i data-lucide="check-circle" style="color: var(--color-resolved); flex-shrink: 0; margin-top: 0.2rem;"></i>
              <div>
                <h4 style="font-weight:700; font-size:0.95rem;">WCAG Compliant UX</h4>
                <p style="color:var(--text-secondary); font-size:0.8rem; margin-top:0.2rem;">Design built with high accessibility compliance and text compatibility.</p>
              </div>
            </div>
            <div style="display:flex; gap: 0.6rem; align-items:flex-start;">
              <i data-lucide="check-circle" style="color: var(--color-resolved); flex-shrink: 0; margin-top: 0.2rem;"></i>
              <div>
                <h4 style="font-weight:700; font-size:0.95rem;">Audit & Accountability</h4>
                <p style="color:var(--text-secondary); font-size:0.8rem; margin-top:0.2rem;">Every reported incident undergoes multi-level state reviews and audits.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="glass" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; background: linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(6,182,212,0.05) 100%);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight:700;">Live City Statistics</h3>
            <span class="badge badge-approved">Real-time Feed</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--primary);">94.8%</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Resolution Rate</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--accent);">420+</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Audited Ramps</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--color-resolved);">1,280</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Active Citizens</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--color-pending);">14 min</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>
    `;
    lucide.createIcons();
    setTimeout(initHomeMap, 100);
  }

  render404() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:calc(100vh - 350px); text-align:center; padding: 2rem; gap:1.5rem;">
        <div class="glass" style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; color: var(--primary); font-size: 3rem;">
          <i data-lucide="compass" style="width:64px; height:64px;"></i>
        </div>
        <h1 style="font-family: var(--font-heading); font-size: 4rem; font-weight: 800; color: var(--primary);">404</h1>
        <h2 style="font-weight:700;">Page Not Found</h2>
        <p style="color:var(--text-secondary); max-width:400px; font-size:0.95rem;">The resource you are looking for does not exist or has been relocated within the municipal portal.</p>
        <a href="#/" class="btn btn-primary">Return to City Homepage</a>
      </div>
    `;
    lucide.createIcons();
  }

  render500(errMessage = '') {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:calc(100vh - 350px); text-align:center; padding: 2rem; gap:1.5rem;">
        <div class="glass" style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; color: var(--color-error); font-size: 3rem; border-color: rgba(239, 68, 68, 0.25);">
          <i data-lucide="shield-alert" style="width:64px; height:64px;"></i>
        </div>
        <h1 style="font-family: var(--font-heading); font-size: 4rem; font-weight: 800; color: var(--color-error);">500</h1>
        <h2 style="font-weight:700;">Internal Portal Error</h2>
        <p style="color:var(--text-secondary); max-width:500px; font-size:0.95rem;">The application encountered an unexpected exception while loading components. Please try refreshing or clearing cache.</p>
        ${errMessage ? `<pre style="background:var(--bg-secondary); padding: 0.8rem; border-radius: 8px; font-size: 0.8rem; color: var(--color-error); border: 1px solid var(--border-color); max-width:600px; overflow-x:auto;">Error context: ${errMessage}</pre>` : ''}
        <a href="#/" class="btn btn-primary">Return to City Homepage</a>
      </div>
    `;
    lucide.createIcons();
  }
}

export const RouterInstance = new Router();
export default RouterInstance;

// Home Page Interactive Mumbai Map Controller
let homeMapInstance = null;

function cleanupHomeMap() {
  if (homeMapInstance) {
    try {
      homeMapInstance.remove();
    } catch (e) {}
    homeMapInstance = null;
  }
}

function initHomeMap() {
  const mapEl = document.getElementById('home-map');
  if (!mapEl) return;

  cleanupHomeMap();

  try {
    homeMapInstance = L.map('home-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([19.0300, 72.8600], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(homeMapInstance);

    // Mumbai Suburban Railway Corridors (Western, Central & Harbour Lines)
    const railCorridors = [
      {
        name: 'Western Line (Churchgate - Dadar - Bandra - Andheri - Borivali)',
        color: '#dc2626',
        coords: [
          [18.9322, 72.8264], [18.9442, 72.8236], [18.9698, 72.8194], [18.9950, 72.8300],
          [19.0178, 72.8430], [19.0550, 72.8402], [19.0820, 72.8385], [19.1197, 72.8464],
          [19.1640, 72.8495], [19.2288, 72.8541]
        ]
      },
      {
        name: 'Central Main Line (CSMT - Byculla - Dadar - Kurla - Ghatkopar - Thane)',
        color: '#2563eb',
        coords: [
          [18.9398, 72.8355], [18.9770, 72.8330], [19.0060, 72.8380], [19.0180, 72.8480],
          [19.0400, 72.8620], [19.0657, 72.8797], [19.0860, 72.9080], [19.1270, 72.9340],
          [19.1860, 72.9759]
        ]
      },
      {
        name: 'Harbour Line (CSMT - Wadala Road - Kurla - Chembur - Vashi)',
        color: '#16a34a',
        coords: [
          [18.9398, 72.8355], [18.9680, 72.8430], [18.9980, 72.8540], [19.0166, 72.8586],
          [19.0340, 72.8640], [19.0657, 72.8797], [19.0622, 72.8995], [19.0500, 72.9310],
          [19.0771, 72.9986]
        ]
      },
      {
        name: 'Metro Line 1 (Versova - Andheri - Ghatkopar Cross Connector)',
        color: '#9333ea',
        coords: [
          [19.1310, 72.8170], [19.1197, 72.8464], [19.1110, 72.8660], [19.1020, 72.8880],
          [19.0860, 72.9080]
        ]
      }
    ];

    railCorridors.forEach(c => {
      L.polyline(c.coords, {
        color: c.color,
        weight: 5,
        opacity: 0.85,
        dashArray: c.name.includes('Metro') ? '4, 8' : null
      }).addTo(homeMapInstance)
        .bindPopup(`<strong>🚆 ${c.name}</strong><br><span style="font-size:0.8rem; color:#64748b;">Active High-Capacity Transit Corridor</span>`);
    });

    // Transit Station Markers across Mumbai
    const stations = DB.getStations();
    stations.forEach(s => {
      const isMetro = s.type === 'metro';
      const isRailway = s.type === 'railway';
      let color = '#3b82f6';
      let iconSymbol = 'bus';
      if (isMetro) { color = '#8b5cf6'; iconSymbol = 'subway'; }
      else if (isRailway) { color = '#ea580c'; iconSymbol = 'train'; }

      const icon = L.divIcon({
        className: 'custom-map-marker marker-transit',
        html: `<div style="background-color: ${color}; color: white; border-radius:50%; width: 26px; height: 26px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);"><i data-lucide="${iconSymbol}" style="width:13px; height:13px;"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([s.lat, s.lng], { icon }).addTo(homeMapInstance)
        .bindPopup(`
          <h3>${isRailway ? '🚆' : isMetro ? '🚇' : '🚌'} ${s.name}</h3>
          <p><strong>Corridor:</strong> ${s.routes.join(', ')}</p>
          <p><strong>Status:</strong> ${s.accessible ? '✅ Wheelchair Accessible Ramps & Elevators' : '⚠️ Limited Accessibility'}</p>
          <p><strong>Schedule:</strong> ${s.timetable[0]}</p>
        `);
    });

    // Active Complaints in Mumbai
    const complaints = DB.getComplaints().filter(c => c.status !== 'rejected');
    complaints.forEach(c => {
      let iconColor = 'var(--color-pending)';
      if (c.status === 'resolved') iconColor = 'var(--color-resolved)';
      if (c.status === 'in-progress') iconColor = 'var(--color-progress)';
      if (c.status === 'under-review') iconColor = 'var(--color-review)';

      const icon = L.divIcon({
        className: 'custom-map-marker marker-complaint',
        html: `<div style="background-color: ${iconColor}; color: white; border-radius:50%; width: 26px; height: 26px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);"><i data-lucide="alert-triangle" style="width:12px; height:12px;"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([c.lat, c.lng], { icon }).addTo(homeMapInstance)
        .bindPopup(`
          <h3>⚠️ Complaint ID: ${c.id}</h3>
          <p><strong>${c.title}</strong></p>
          <p>Status: <span class="badge badge-${c.status}">${c.status}</span></p>
          <p>Address: ${c.address}</p>
          <a href="#/track?id=${c.id}" style="color:var(--primary); font-weight:700; font-size:0.8rem;">Track progress &rarr;</a>
        `);
    });

    lucide.createIcons();
  } catch (err) {
    console.error('Error initializing Home Map:', err);
  }
}
