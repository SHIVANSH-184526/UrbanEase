/* Analytics Visualization Dashboard Engine (js/analytics.js) */

import { DB } from './state.js';

let chart1 = null;
let chart2 = null;
let chart3 = null;
let chart4 = null;

export function RenderAnalyticsCharts() {
  const complaints = DB.getComplaints();
  
  // Calculate Categories Counts for all 9 categories
  const catCounts = {
    pothole: 0,
    'broken-traffic-signal': 0,
    'streetlight-problem': 0,
    'garbage-waste': 0,
    'water-leakage': 0,
    'road-damage': 0,
    'footpath-obstruction': 0,
    'accessibility-issue': 0,
    other: 0
  };
  
  complaints.forEach(c => {
    const key = c.category;
    if (catCounts[key] !== undefined) {
      catCounts[key]++;
    } else {
      catCounts.other++;
    }
  });

  // Calculate 6-Stage Status Counts
  const statusCounts = {
    submitted: 0,
    'under-review': 0,
    verified: 0,
    assigned: 0,
    'in-progress': 0,
    resolved: 0
  };
  
  complaints.forEach(c => {
    const key = c.status;
    if (statusCounts[key] !== undefined) {
      statusCounts[key]++;
    }
  });

  // 1. Complaint Categories Distribution (Pie/Doughnut)
  const ctx1 = document.getElementById('chart-categories');
  if (ctx1) {
    if (chart1) chart1.destroy();
    
    chart1 = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Pothole', 'Traffic Signal', 'Streetlight', 'Garbage/Waste', 'Water Leak', 'Road Damage', 'Obstruction', 'Accessibility', 'Other'],
        datasets: [{
          data: [
            catCounts['pothole'],
            catCounts['broken-traffic-signal'],
            catCounts['streetlight-problem'],
            catCounts['garbage-waste'],
            catCounts['water-leakage'],
            catCounts['road-damage'],
            catCounts['footpath-obstruction'],
            catCounts['accessibility-issue'],
            catCounts['other']
          ],
          backgroundColor: [
            '#ef4444', // red
            '#f97316', // orange
            '#facc15', // yellow
            '#10b981', // green
            '#06b6d4', // cyan
            '#3b82f6', // blue
            '#6366f1', // indigo
            '#8b5cf6', // purple
            '#64748b'  // slate
          ],
          borderWidth: 1,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
              font: { family: 'Inter', size: 10 }
            }
          }
        }
      }
    });
  }

  // 2. Case Resolution Status Performance (6-Stage Bar Chart)
  const ctx2 = document.getElementById('chart-resolutions');
  if (ctx2) {
    if (chart2) chart2.destroy();

    chart2 = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['1. Submitted', '2. Under Review', '3. Verified', '4. Assigned', '5. In Progress', '6. Resolved'],
        datasets: [{
          label: 'Incidents in Stage',
          data: [
            statusCounts['submitted'],
            statusCounts['under-review'],
            statusCounts['verified'],
            statusCounts['assigned'],
            statusCounts['in-progress'],
            statusCounts['resolved']
          ],
          backgroundColor: [
            'rgba(100, 116, 139, 0.75)', // submitted
            'rgba(99, 102, 241, 0.75)',  // review
            'rgba(2, 132, 199, 0.75)',   // verified
            'rgba(139, 92, 246, 0.75)',  // assigned
            'rgba(6, 182, 212, 0.75)',   // in progress
            'rgba(16, 185, 129, 0.75)'   // resolved
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
              stepSize: 1
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 3. Monthly Citizen Complaint Trends (Line Chart)
  const ctx3 = document.getElementById('chart-registrations');
  if (ctx3) {
    if (chart3) chart3.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    chart3 = new Chart(ctx3, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Total Incidents Reported',
          data: [120, 185, 240, 310, 390, 480],
          borderColor: '#2563eb',
          backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.05)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 4. Verified vs Spammed Trends (Stacked Bar)
  const ctx4 = document.getElementById('chart-fake-trends');
  if (ctx4) {
    if (chart4) chart4.destroy();

    chart4 = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: ['Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Verified Complaints',
            data: [42, 68, 85],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Spam / Fake Blocked',
            data: [14, 9, 3],
            backgroundColor: '#ef4444',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
            }
          }
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            stacked: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}
