const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const tbody = document.querySelector('#statsTable tbody');

let pageVisitsChart, browserChart, deviceChart;

function isInDateRange(isoDate, start, end) {
  const date = new Date(isoDate);
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function detectBrowser(ua) {
  ua = ua.toLowerCase();
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
  return 'Lòt';
}

function detectDevice(ua) {
  ua = ua.toLowerCase();
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function loadAndRenderData(startDate = null, endDate = null) {
  const visitsRef = database.ref('visits');
  visitsRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      tbody.innerHTML = '<tr><td colspan="3">Pa gen done</td></tr>';
      return;
    }
    
    const stats = {}; // Nou pral regwoupe pa userId
    const browsers = {};
    const devices = {};
    
    for (const key in data) {
      const visit = data[key];
      if (!isInDateRange(visit.timestamp, startDate, endDate)) continue;
      console.log(visit);
      const userId = visit.userId || 'SanUserId';
      const browser = detectBrowser(visit.userAgent);
      const device = detectDevice(visit.userAgent);
      
      if (!stats[userId]) {
        stats[userId] = {
          totalVisits: 0,
          pages: new Set(),
          keys: [],
          ips: new Set(),
          countries: new Set(),
          regions: new Set()
        };
      }
      
      stats[userId].totalVisits++;
      stats[userId].pages.add(visit.page);
      stats[userId].keys.push(key);
      
      if (visit.ip) stats[userId].ips.add(visit.ip);
      if (visit.country) stats[userId].countries.add(visit.country);
      if (visit.region) stats[userId].regions.add(visit.region);
      
      browsers[browser] = (browsers[browser] || 0) + 1;
      devices[device] = (devices[device] || 0) + 1;
    }
    
    tbody.innerHTML = '';
    for (const userId in stats) {
      const row = document.createElement('tr');
      const adminIds = ['user-meukwl1ra', 'user-rud2yj3ap', 'user-9sfr3rvha'];
      row.dataset.keys = JSON.stringify(stats[userId].keys);
      
      row.innerHTML = `
    <td><input type="checkbox" class="rowCheckbox"></td>
    <td>
  ${adminIds.includes(userId) ? `<span class="badge-admin">Adm</span>` : ''}
  ${userId}
</td>
    <td>${stats[userId].totalVisits}</td>
    <td>${stats[userId].pages.size}</td>
    <td class="extra-column">${Array.from(stats[userId].ips).join(', ') || 'N/A'}</td>
    <td class="extra-column">${
      Array.from(stats[userId].countries)
        .map(country => getCountryFlagHTML(country))
        .join('<br>') || 'N/A'
    }</td>
    <td class="extra-column">${Array.from(stats[userId].regions).join(', ') || 'N/A'}</td>
  `;
      
      tbody.appendChild(row);
    }
    
    
    const pagesSorted = Object.entries(stats)
      .sort((a, b) => b[1].totalVisits - a[1].totalVisits)
      .slice(0, 10);
    
    const pageLabels = pagesSorted.map(e => e[0]);
    const pageVisits = pagesSorted.map(e => e[1].totalVisits);
    
    if (pageVisitsChart) {
      pageVisitsChart.data.labels = pageLabels;
      pageVisitsChart.data.datasets[0].data = pageVisits;
      pageVisitsChart.update();
    } else {
      const ctx = document.getElementById('pageVisitsChart').getContext('2d');
      pageVisitsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: pageLabels,
          datasets: [{
            label: 'Vizit Paj',
            data: pageVisits,
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
    
    const browserLabels = Object.keys(browsers);
    const browserData = Object.values(browsers);
    
    if (browserChart) {
      browserChart.data.labels = browserLabels;
      browserChart.data.datasets[0].data = browserData;
      browserChart.update();
    } else {
      const ctx = document.getElementById('browserChart').getContext('2d');
      browserChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: browserLabels,
          datasets: [{
            label: 'Navigatè',
            data: browserData,
            backgroundColor: ['#4285F4', '#FF7139', '#FFCA28', '#0F9D58', '#AB47BC', '#9E9E9E']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
    
    const deviceLabels = Object.keys(devices);
    const deviceData = Object.values(devices);
    
    if (deviceChart) {
      deviceChart.data.labels = deviceLabels;
      deviceChart.data.datasets[0].data = deviceData;
      deviceChart.update();
    } else {
      const ctx = document.getElementById('deviceChart').getContext('2d');
      deviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: deviceLabels,
          datasets: [{
            label: 'Aparèy',
            data: deviceData,
            backgroundColor: ['#2196F3', '#FFC107', '#4CAF50']
          }]
        }
      });
    }
  });
}

const selectAllCheckbox = document.getElementById('selectAll');
selectAllCheckbox.addEventListener('change', () => {
  const checkboxes = document.querySelectorAll('.rowCheckbox');
  checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
});

const deleteSelectedBtnvisite = document.getElementById('deleteSelected');

deleteSelectedBtnvisite.addEventListener('click', () => {
  const checkedRows = [...document.querySelectorAll('.rowCheckbox:checked')]
    .map(checkbox => checkbox.closest('tr'));
  
  if (checkedRows.length === 0) {
    alert('Pa gen okenn chwa chwazi pou siprime.');
    return;
  }
  
  if (!confirm(`Èske w vle vrèman efase ${checkedRows.length} chwa sa yo nan baz done a?`)) {
    return;
  }
  
  // Pou chak ranje, jwenn kle Firebase yo epi efase chak done nan Firebase
  const promises = [];
  
  checkedRows.forEach(row => {
    const keys = JSON.parse(row.dataset.keys || '[]');
    keys.forEach(key => {
      const ref = database.ref('visits/' + key);
      promises.push(ref.remove());
    });
  });
  
  Promise.all(promises)
    .then(() => {
      alert('Sipresyon fini.');
      // Rechaje tablo a apre efasman
      loadAndRenderData(getDate(startDateInput), getDate(endDateInput));
    })
    .catch(error => {
      console.error('Erè pandan sipresyon:', error);
      alert('Gen yon erè pandan sipresyon. Tcheke konsòl la.');
    });
});

function getDate(input) {
  return input.value ? new Date(input.value + 'T00:00:00') : null;
}

filterBtn.addEventListener('click', () => {
  const startDate = getDate(startDateInput);
  const endDate = getDate(endDateInput);
  loadAndRenderData(startDate, endDate);
});

resetBtn.addEventListener('click', () => {
  startDateInput.value = '';
  endDateInput.value = '';
  loadAndRenderData();
});

window.addEventListener('load', () => {
  loadAndRenderData();
});



function getCountryFlagHTML(countryName) {
  const countryMap = {
    "Haiti": "ht",
    "France": "fr",
    "United States": "us",
    "Canada": "ca",
    "Dominican Republic": "do",
    "Brazil": "br",
    "Germany": "de",
    "Spain": "es",
    "United Kingdom": "gb",
    "India": "in",
    "Mexico": "mx",
    "Italy": "it",
    "China": "cn",
    "Japan": "jp"
    // ajoute plis si ou vle
  };
  
  const code = countryMap[countryName];
  if (!code) return countryName;
  
  return `<img src="https://flagcdn.com/24x18/${code}.png" alt="${countryName}" style="vertical-align:middle; margin-right:5px;" />${countryName}`;
}
const toggleBtn = document.getElementById('toggleExtraCols');
const statsTable = document.getElementById('statsTable');

toggleBtn.addEventListener('click', () => {
  const showing = statsTable.classList.toggle('show-extra');
  toggleBtn.textContent = showing ? '▼' : '▶'; // chanje flèch la
});