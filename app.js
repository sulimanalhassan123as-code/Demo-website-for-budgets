// ============================================================
//  SWIFTDROP LITE — Option B Demo
// ============================================================

const RIDERS_DATA = [
  { name:'Issah Mohammed',   phone:'055-123-4567', plate:'GR-2847-21', status:'online',  rating:4.8, jobs:23, earn:'GHS 412.50' },
  { name:'Abdul Razak',      phone:'024-876-5432', plate:'GR-1102-20', status:'online',  rating:4.6, jobs:15, earn:'GHS 287.00' },
  { name:'Fuseini Alhassan', phone:'050-334-9921', plate:'GR-5589-22', status:'offline', rating:4.9, jobs:34, earn:'GHS 561.00' },
  { name:'Yakubu Dawuni',    phone:'027-445-3310', plate:'GR-0034-21', status:'online',  rating:4.5, jobs:12, earn:'GHS 194.00' },
  { name:'Sumaila Iddrisu',  phone:'026-881-2234', plate:'GR-7723-23', status:'online',  rating:4.7, jobs:19, earn:'GHS 330.50' },
];

const ORDERS_DATA = [
  { id:'ORD-1041', from:'Central Market',  to:'Kaladan Estate',   type:'Package',  amount:'GHS 15.00', status:'done',    rider:'Issah M.',   customer:'Sandra A.' },
  { id:'ORD-1042', from:'Melcom Area',     to:'Gurugu',           type:'Food',     amount:'GHS 8.50',  status:'transit', rider:'Abdul R.',   customer:'Amina S.' },
  { id:'ORD-1043', from:'Tamale Hospital', to:'Choggu',           type:'Medicine', amount:'GHS 20.00', status:'pending', rider:'Searching…', customer:'Kofi A.' },
  { id:'ORD-1044', from:'Ghana Post',      to:'Lamashegu',        type:'Documents',amount:'GHS 12.00', status:'transit', rider:'Yakubu D.',  customer:'Fatima A.' },
  { id:'ORD-1045', from:'Zogbeli',         to:'Nyohini',          type:'Package',  amount:'GHS 9.00',  status:'pending', rider:'Searching…', customer:'David B.' },
  { id:'ORD-1046', from:'Aboabo',          to:'Vittin Camp',      type:'Groceries',amount:'GHS 18.00', status:'done',    rider:'Issah M.',   customer:'Sandra A.' },
  { id:'ORD-1047', from:'Dillard Street',  to:'Savelugu Rd',      type:'Package',  amount:'GHS 14.50', status:'transit', rider:'Sumaila I.', customer:'Amina S.' },
  { id:'ORD-1048', from:'Central Market',  to:'Vittin Camp',      type:'Food',     amount:'GHS 11.00', status:'done',    rider:'Abdul R.',   customer:'Kofi A.' },
];

const WA_LOG = [
  { rider:'Issah Mohammed',  message:'New job: Central Market → Kaladan. GHS 12.00', time:'9:41 AM',  status:'Delivered' },
  { rider:'Abdul Razak',     message:'New job: Melcom → Gurugu. GHS 7.20',          time:'9:28 AM',  status:'In Transit' },
  { rider:'Yakubu Dawuni',   message:'New job: Ghana Post → Lamashegu. GHS 9.60',   time:'9:10 AM',  status:'In Transit' },
  { rider:'Sumaila Iddrisu', message:'New job: Dillard → Savelugu Rd. GHS 11.60',   time:'8:55 AM',  status:'In Transit' },
  { rider:'Issah Mohammed',  message:'New job: Aboabo → Vittin Camp. GHS 14.40',    time:'8:30 AM',  status:'Delivered' },
];

const TOPUP_DATA = [
  { name:'Sandra Amobea', amount:'GHS 50.00', method:'MTN MoMo', time:'9:15 AM' },
  { name:'Amina Salifu',  amount:'GHS 100.00',method:'Telecel Cash', time:'8:40 AM' },
  { name:'Kofi Asante',   amount:'GHS 30.00', method:'Bank Transfer', time:'8:10 AM' },
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const CHART_VALS = [12, 19, 15, 27, 22, 34, 17];

let jobStep = 1;
let adminInterval = null;
const liveStats = { orders:47, riders:4, customers:38, revenue:1840 };

// ============================================================
//  SPLASH
// ============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('out');
    setTimeout(() => {
      document.getElementById('splash').remove();
      document.getElementById('app').classList.remove('hidden');
    }, 500);
  }, 2000);
});

// ============================================================
//  TOAST
// ============================================================
function toast(msg, type = 'info', dur = 3200) {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const ic = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  el.textContent = `${ic[type]||''} ${msg}`;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transition='.3s'; setTimeout(()=>el.remove(),300); }, dur);
}

// ============================================================
//  NAVIGATION
// ============================================================
function enterAs(role) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
  const t = document.getElementById(`screen-${role}`);
  t.classList.remove('hidden'); t.classList.add('active');
  if (role === 'admin') { initAdmin(); startAdminTicker(); }
  toast({ customer:'Welcome to the Customer PWA 📱', rider:'Rider WhatsApp flow 🟢', admin:'Admin Dashboard 🛡' }[role] || '', 'success');
}

function goBack() {
  clearInterval(adminInterval);
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
  document.getElementById('screen-role').classList.remove('hidden');
  document.getElementById('screen-role').classList.add('active');
}

// ============================================================
//  CUSTOMER PWA
// ============================================================
function pickChip(el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function pwaTab(tab, btn) {
  document.querySelectorAll('.pnav').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const renders = { home: renderPwaHome, orders: renderPwaOrders, wallet: renderPwaWallet, profile: renderPwaProfile };
  if (renders[tab]) renders[tab]();
}

function renderPwaHome() {
  const body = document.getElementById('pwa-body');
  body.innerHTML = document.getElementById('pwa-home-tpl')?.innerHTML || `<div id="pwa-home">${document.getElementById('pwa-home')?.innerHTML||''}</div>`;
}

function renderPwaOrders() {
  document.getElementById('pwa-body').innerHTML = `
    <div style="padding:14px">
      <div class="sec-title" style="padding:0 0 10px">My Orders</div>
      ${ORDERS_DATA.slice(0,5).filter((_,i)=>i<4).map(o=>`
        <div class="recent-item" style="margin-bottom:9px">
          <div class="ri-icon ${o.type==='Food'?'orange':o.type==='Medicine'?'green':'purple'}">
            <i class="fas ${o.type==='Food'?'fa-burger':o.type==='Medicine'?'fa-pills':'fa-box'}"></i>
          </div>
          <div class="ri-info">
            <p>${o.from} → ${o.to}</p>
            <span>${o.amount} · ${o.rider}</span>
          </div>
          <span class="sp ${o.status==='done'?'sp-done':o.status==='transit'?'sp-transit':'sp-pending'}">
            ${o.status==='done'?'Done':o.status==='transit'?'Transit':'Pending'}
          </span>
        </div>`).join('')}
    </div>`;
}

function renderPwaWallet() {
  document.getElementById('pwa-body').innerHTML = `
    <div style="padding:14px">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:18px;padding:22px;color:#fff;margin-bottom:16px">
        <p style="opacity:.7;font-size:.76rem;margin-bottom:4px">Available Balance</p>
        <h2 style="font-size:1.9rem;font-weight:800">GHS 48.50</h2>
        <p style="opacity:.6;font-size:.72rem;margin-top:4px">Last top-up: GHS 50.00 · May 22</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <button style="padding:13px;border-radius:13px;border:1.5px solid #6366f1;background:rgba(99,102,241,.07);color:#6366f1;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:.84rem" onclick="toast('Send bank details to top-up via MoMo or Bank!','info',4000)">
          <i class="fas fa-plus"></i> Top Up
        </button>
        <button style="padding:13px;border-radius:13px;border:1.5px solid var(--border);background:#fff;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:.84rem" onclick="toast('Withdrawal request sent!','success')">
          <i class="fas fa-arrow-up"></i> Withdraw
        </button>
      </div>
      <div class="sec-title" style="padding:0 0 8px">Transactions</div>
      ${[
        ['Delivery → Kaladan','−GHS 15.00','Today'],
        ['Top-up (MTN MoMo)','+GHS 50.00','May 22'],
        ['Delivery → Gurugu','−GHS 8.50','May 21'],
        ['Delivery → Teaching','−GHS 20.00','May 20'],
      ].map(([l,a,d])=>`
        <div class="recent-item" style="margin-bottom:8px">
          <div class="ri-icon ${a.startsWith('+')?'green':'purple'}">
            <i class="fas ${a.startsWith('+')?'fa-arrow-down':'fa-arrow-up'}"></i>
          </div>
          <div class="ri-info"><p>${l}</p><span>${d}</span></div>
          <strong style="color:${a.startsWith('+')?'var(--green)':'var(--text)'};font-size:.85rem">${a}</strong>
        </div>`).join('')}
    </div>`;
}

function renderPwaProfile() {
  document.getElementById('pwa-body').innerHTML = `
    <div style="padding:20px;text-align:center">
      <div style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.7rem;margin:0 auto 10px">
        <i class="fas fa-user"></i>
      </div>
      <h3 style="font-weight:700;margin-bottom:3px">Sandra Amobea</h3>
      <p style="color:var(--dim);font-size:.83rem;margin-bottom:20px">059-993-1348</p>
      ${[['Total Orders','12'],['Wallet Balance','GHS 48.50'],['Member Since','Jan 2025'],['Deliveries Done','12']].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--dim);font-size:.85rem">${k}</span>
          <strong style="font-size:.85rem">${v}</strong>
        </div>`).join('')}
      <button onclick="goBack()" style="width:100%;margin-top:18px;padding:13px;border-radius:13px;border:1.5px solid var(--border);background:transparent;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;color:var(--dim)">
        Switch Role
      </button>
    </div>`;
}

let etaTimer = null;
function placeOrder() {
  const pickup  = document.getElementById('pickup-input')?.value.trim();
  const dropoff = document.getElementById('dropoff-input')?.value.trim();
  if (!dropoff) { toast('Please enter a dropoff location!', 'error'); return; }

  document.querySelector('.order-form-card')?.classList.add('hidden');
  const ac = document.getElementById('active-card');
  ac?.classList.remove('hidden');

  const banner = document.getElementById('status-banner');
  banner?.classList.remove('hidden');

  toast('🚀 Rider found! Issah M. is heading to pickup.', 'success', 5000);

  let eta = 4;
  clearInterval(etaTimer);
  etaTimer = setInterval(() => {
    eta--;
    const e1 = document.getElementById('ac-eta');
    const e2 = document.getElementById('status-eta');
    if (e1) e1.textContent = eta > 0 ? `ETA ${eta} min` : 'Arriving!';
    if (e2) e2.textContent = eta > 0 ? `${eta} min` : '🔔';
    if (eta <= 0) clearInterval(etaTimer);
  }, 7000);

  // Auto-progress
  setTimeout(() => {
    const s3 = document.getElementById('ss3');
    if (s3) { s3.classList.remove('active'); s3.classList.add('done'); }
    const s4 = document.getElementById('ss4');
    if (s4) s4.classList.add('active');
    const st = document.getElementById('status-title');
    const ss = document.getElementById('status-sub');
    if (st) st.textContent = 'Package picked up';
    if (ss) ss.textContent = 'Rider is on the way to you';
    toast('📦 Package picked up! On the way.', 'info', 3500);
  }, 8000);

  setTimeout(() => {
    const s4 = document.getElementById('ss4');
    if (s4) { s4.classList.remove('active'); s4.classList.add('done'); }
    const st = document.getElementById('status-title');
    const ss = document.getElementById('status-sub');
    if (st) st.textContent = 'Delivered! 🎉';
    if (ss) ss.textContent = 'Your package has been delivered';
    toast('🎉 Delivered! Rate your experience.', 'success', 5000);
  }, 15000);
}

// ============================================================
//  RIDER FLOW
// ============================================================
function riderAccept() {
  document.querySelector('.wa-bubble .wa-btn').style.background = '#128C7E';
  document.querySelector('.wa-bubble .wa-btn').textContent = '✅ Accepted!';
  document.getElementById('rider-job')?.classList.remove('hidden');
  toast('Job accepted! Head to pickup point. 🏍', 'success');
  const js1 = document.getElementById('js1');
  if (js1) js1.classList.add('done');
}

const jobLabels = ['Mark At Pickup','Mark In Transit','Mark Delivered','Done ✓'];
const jobToasts = [
  '📍 Marked at pickup location.',
  '🏍 Marked in transit — heading to dropoff.',
  '🎉 Delivery complete! GHS 9.60 added to your wallet.',
  ''
];
let currentJobStep = 1;

function advanceJob() {
  if (currentJobStep >= 4) return;
  currentJobStep++;

  const ids = ['js1','js2','js3','js4'];
  document.getElementById(ids[currentJobStep-1])?.classList.remove('active');
  document.getElementById(ids[currentJobStep-1])?.classList.add('done');
  if (currentJobStep < 4) document.getElementById(ids[currentJobStep])?.classList.add('active');

  const btn = document.getElementById('job-cta');
  if (btn) {
    if (currentJobStep < 4) {
      btn.innerHTML = `<i class="fas fa-arrow-right"></i> ${jobLabels[currentJobStep-1]}`;
    } else {
      btn.innerHTML = '🎉 Job Complete!';
      btn.disabled = true; btn.style.opacity = '.6';
    }
  }

  if (jobToasts[currentJobStep-1]) toast(jobToasts[currentJobStep-1], currentJobStep===3?'success':'info', 4000);
}

// ============================================================
//  ADMIN
// ============================================================
function initAdmin() {
  animateKpis();
  renderPendingOrders();
  renderAllOrders('all');
  renderRiders();
  renderTopup();
  renderWaLog();
  renderMiniChart();
  renderTopRiders();
}

function startAdminTicker() {
  clearInterval(adminInterval);
  adminInterval = setInterval(() => {
    liveStats.orders++;
    const el = document.getElementById('k-orders');
    if (el) el.textContent = liveStats.orders;
    if (Math.random() > 0.5) {
      liveStats.revenue += Math.floor(Math.random()*14+7);
      const rev = document.getElementById('k-revenue');
      if (rev) rev.textContent = liveStats.revenue.toLocaleString();
    }
  }, 5000);
}

function aTab(tab, btn) {
  document.querySelectorAll('.snav').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.atab').forEach(t => { t.classList.add('hidden'); t.classList.remove('active'); });
  const el = document.getElementById(`tab-${tab}`);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
  document.getElementById('page-title').textContent = btn.textContent.trim();
}

function animateKpis() {
  [['k-orders',liveStats.orders],['k-riders',liveStats.riders],['k-customers',liveStats.customers],['k-revenue',liveStats.revenue]].forEach(([id,val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start)/1400, 1);
      const v = Math.floor(val * ease(p));
      el.textContent = id==='k-revenue' ? v.toLocaleString() : v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
function ease(t){ return 1 - Math.pow(1-t,3); }

function filterOrders(val) { renderAllOrders(val); }

function renderPendingOrders() {
  const pending = ORDERS_DATA.filter(o => o.status === 'pending');
  const el = document.getElementById('pending-orders');
  if (!el) return;
  document.getElementById('pending-count').textContent = pending.length;
  el.innerHTML = pending.map(o => `
    <div class="order-row">
      <div class="or-icon"><i class="fas fa-box"></i></div>
      <div class="or-info">
        <p>${o.id} — ${o.from} → ${o.to}</p>
        <span>${o.type} · ${o.customer}</span>
      </div>
      <span class="or-amount">${o.amount}</span>
      <span class="sp sp-pending">Pending</span>
      <button class="btn-sm" style="margin-left:8px" onclick="assignRider('${o.id}',this)">Assign Rider</button>
    </div>`).join('');
}

function assignRider(id, btn) {
  btn.textContent = '✅ Assigned';
  btn.style.color = 'var(--green)';
  btn.style.borderColor = 'var(--green)';
  btn.disabled = true;
  toast(`Rider assigned to ${id} via WhatsApp!`, 'success');
}

function renderAllOrders(filter) {
  const el = document.getElementById('all-orders-list');
  if (!el) return;
  const data = filter === 'all' ? ORDERS_DATA
    : filter === 'pending' ? ORDERS_DATA.filter(o=>o.status==='pending')
    : filter === 'transit' ? ORDERS_DATA.filter(o=>o.status==='transit')
    : ORDERS_DATA.filter(o=>o.status==='done');

  el.innerHTML = data.map(o => `
    <div class="order-row">
      <div class="or-icon"><i class="fas fa-box"></i></div>
      <div class="or-info">
        <p>${o.id} — ${o.from} → ${o.to}</p>
        <span>${o.type} · ${o.customer} · Rider: ${o.rider}</span>
      </div>
      <span class="or-amount">${o.amount}</span>
      <span class="sp ${o.status==='done'?'sp-done':o.status==='transit'?'sp-transit':'sp-pending'}">
        ${o.status==='done'?'Delivered':o.status==='transit'?'In Transit':'Pending'}
      </span>
      <button class="btn-sm" style="margin-left:8px" onclick="toast('Order ${o.id} details opened','info')">View</button>
    </div>`).join('');
}

function renderRiders() {
  const el = document.getElementById('riders-list');
  if (!el) return;
  el.innerHTML = RIDERS_DATA.map(r => `
    <div class="rider-row">
      <div class="r-avatar"><i class="fas fa-user"></i></div>
      <div class="r-info">
        <p>${r.name}</p>
        <span>${r.phone} · ${r.plate}</span>
      </div>
      <span class="sp ${r.status==='online'?'sp-done':'sp-pending'}" style="margin-right:8px">
        ${r.status==='online'?'Online':'Offline'}
      </span>
      <span style="font-size:.8rem;color:var(--dim);margin-right:10px">⭐${r.rating} · ${r.jobs} jobs</span>
      <strong style="font-size:.82rem;color:var(--green);margin-right:10px">${r.earn}</strong>
      <button class="btn-sm" onclick="toast('${r.name} WhatsApp message sent!','success')">
        <i class="fab fa-whatsapp"></i> Message
      </button>
    </div>`).join('');
}

function renderTopup() {
  const el = document.getElementById('topup-list');
  if (!el) return;
  el.innerHTML = TOPUP_DATA.map(t => `
    <div class="tu-row">
      <div class="or-icon"><i class="fas fa-wallet" style="color:var(--primary)"></i></div>
      <div class="tu-info">
        <p>${t.name} — <strong>${t.amount}</strong></p>
        <span>${t.method} · ${t.time}</span>
      </div>
      <button class="btn-approve" onclick="approveTopup(this,'${t.name}')">Approve</button>
    </div>`).join('');
}

function approveTopup(btn, name) {
  btn.textContent = '✅ Approved';
  btn.disabled = true;
  btn.style.background = 'var(--dim)';
  toast(`Top-up approved for ${name}!`, 'success');
}

function renderWaLog() {
  const el = document.getElementById('wa-log');
  if (!el) return;
  el.innerHTML = WA_LOG.map(w => `
    <div class="wa-row">
      <div class="wa-row-icon"><i class="fab fa-whatsapp"></i></div>
      <div class="wa-row-info">
        <p>→ ${w.rider}</p>
        <span>${w.message}</span>
      </div>
      <div style="text-align:right">
        <div class="wa-sent">✓✓ Sent</div>
        <div style="font-size:.7rem;color:var(--dim);margin-top:2px">${w.time}</div>
        <div class="sp ${w.status==='Delivered'?'sp-done':'sp-transit'}" style="margin-top:3px;font-size:.66rem">
          ${w.status}
        </div>
      </div>
    </div>`).join('');
}

function renderMiniChart() {
  const max = Math.max(...CHART_VALS);
  const el  = document.getElementById('mini-chart');
  if (!el) return;
  el.innerHTML = CHART_VALS.map((v,i) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end">
      <span style="font-size:.62rem;font-weight:700;color:var(--orange)">${v}</span>
      <div class="mb" style="height:${Math.round(v/max*70)}px" title="${DAYS[i]}:${v}"></div>
      <span class="mb-l">${DAYS[i]}</span>
    </div>`).join('');
}

function renderTopRiders() {
  const el = document.getElementById('top-riders');
  if (!el) return;
  const sorted = [...RIDERS_DATA].sort((a,b) => b.jobs - a.jobs).slice(0,4);
  el.innerHTML = sorted.map((r,i) => `
    <div class="tr-row">
      <div class="tr-num">${i+1}</div>
      <div class="tr-info">
        <p>${r.name}</p>
        <span>${r.jobs} deliveries · ⭐${r.rating}</span>
      </div>
      <strong style="font-size:.82rem;color:var(--green)">${r.earn}</strong>
    </div>`).join('');
}
