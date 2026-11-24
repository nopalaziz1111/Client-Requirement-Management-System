/**
 * Client Requirement Management System - Admin Dashboard Logic
 */

class AdminApp {
  constructor() {
    this.submissions = [];
    this.filteredSubmissions = [];
    this.selectedSubmission = null;

    this.cacheElements();
    this.bindEvents();
    this.checkAuth();
  }

  cacheElements() {
    this.loginScreen = document.getElementById('login-screen');
    this.dashboardScreen = document.getElementById('dashboard-screen');
    this.loginForm = document.getElementById('admin-login-form');
    this.loginEmail = document.getElementById('login-email');
    this.loginPassword = document.getElementById('login-password');
    this.btnLoginSubmit = document.getElementById('btn-login-submit');
    this.btnLogout = document.getElementById('btn-logout');

    // Stat Elements
    this.statTotal = document.getElementById('stat-total');
    this.statPending = document.getElementById('stat-pending');
    this.statInProgress = document.getElementById('stat-in-progress');
    this.statCompleted = document.getElementById('stat-completed');

    // Filter & Search Controls
    this.filterSearch = document.getElementById('filter-search');
    this.filterWebsiteType = document.getElementById('filter-website-type');
    this.filterStatus = document.getElementById('filter-status');
    this.btnResetFilters = document.getElementById('btn-reset-filters');
    this.btnRefreshData = document.getElementById('btn-refresh-data');
    this.btnExportCSV = document.getElementById('btn-export-csv');

    // Table
    this.tableBody = document.getElementById('submissions-tbody');
    this.emptyState = document.getElementById('empty-state');

    // Detail Modal
    this.detailModal = document.getElementById('detail-modal');
    this.modalClientName = document.getElementById('modal-client-name');
    this.modalSubId = document.getElementById('modal-sub-id');
    this.modalDetailContent = document.getElementById('modal-detail-content');
    this.modalUpdateStatus = document.getElementById('modal-update-status');
    this.btnSaveStatus = document.getElementById('btn-save-status');

    // Settings Modal
    this.settingsModal = document.getElementById('settings-modal');
    this.navBtnSettings = document.getElementById('nav-btn-settings');
    this.supabaseSettingsForm = document.getElementById('supabase-settings-form');
    this.settingSupabaseUrl = document.getElementById('setting-supabase-url');
    this.settingSupabaseKey = document.getElementById('setting-supabase-key');
    this.btnResetSupabase = document.getElementById('btn-reset-supabase');
    this.backendStatusBadge = document.getElementById('backend-status-badge');
  }

  bindEvents() {
    // Login form
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.btnLogout.addEventListener('click', () => this.handleLogout());

    // Search and Filters
    this.filterSearch.addEventListener('input', () => this.applyFilters());
    this.filterWebsiteType.addEventListener('change', () => this.applyFilters());
    this.filterStatus.addEventListener('change', () => this.applyFilters());
    this.btnResetFilters.addEventListener('click', () => this.resetFilters());
    this.btnRefreshData.addEventListener('click', () => this.loadData(true));
    this.btnExportCSV.addEventListener('click', () => this.exportCSV());

    // Status update in Modal
    this.btnSaveStatus.addEventListener('click', () => this.saveStatusFromModal());

    // Settings Modal
    this.navBtnSettings.addEventListener('click', (e) => {
      e.preventDefault();
      this.openSettingsModal();
    });
    this.backendStatusBadge.addEventListener('click', () => this.openSettingsModal());
    this.supabaseSettingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
    this.btnResetSupabase.addEventListener('click', () => this.handleResetSettings());
  }

  // --- AUTHENTICATION ---

  async checkAuth() {
    const isAuth = window.crmSupabase.isAdminAuthenticated();
    if (isAuth) {
      this.showDashboard();
      this.loadData();
    } else {
      this.showLogin();
    }
    this.updateBackendStatusBadge();
  }

  showLogin() {
    this.loginScreen.style.display = 'flex';
    this.dashboardScreen.style.display = 'none';
  }

  showDashboard() {
    this.loginScreen.style.display = 'none';
    this.dashboardScreen.style.display = 'flex';
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = this.loginEmail.value.trim();
    const password = this.loginPassword.value.trim();

    this.btnLoginSubmit.disabled = true;
    this.btnLoginSubmit.textContent = 'Memverifikasi...';

    const res = await window.crmSupabase.login(email, password);

    this.btnLoginSubmit.disabled = false;
    this.btnLoginSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
      Masuk ke Dashboard
    `;

    if (res.success) {
      this.showToast('Login berhasil! Selamat datang di dashboard.', 'success');
      this.showDashboard();
      this.loadData();
    } else {
      this.showToast(res.error || 'Login gagal. Periksa email dan password.', 'error');
    }
  }

  async handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
      await window.crmSupabase.logout();
      this.showToast('Berhasil logout.', 'info');
      this.showLogin();
    }
  }

  // --- DATA LOADING & METRICS ---

  async loadData(showToastFeedback = false) {
    try {
      const res = await window.crmSupabase.getSubmissions();
      if (res.success) {
        this.submissions = res.data || [];
        this.applyFilters();
        this.computeStats();
        if (showToastFeedback) {
          this.showToast('Data pengajuan berhasil diperbarui.', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      this.showToast('Gagal memuat data pengajuan.', 'error');
    }
  }

  computeStats() {
    const total = this.submissions.length;
    const pending = this.submissions.filter(s => s.status === 'Pending').length;
    const inProgress = this.submissions.filter(s => s.status === 'Reviewing' || s.status === 'In Progress').length;
    const completed = this.submissions.filter(s => s.status === 'Completed').length;

    this.statTotal.textContent = total;
    this.statPending.textContent = pending;
    this.statInProgress.textContent = inProgress;
    this.statCompleted.textContent = completed;
  }

  // --- FILTERS & SEARCH ---

  applyFilters() {
    const query = this.filterSearch.value.trim().toLowerCase();
    const typeFilter = this.filterWebsiteType.value;
    const statusFilter = this.filterStatus.value;

    this.filteredSubmissions = this.submissions.filter(item => {
      // Search matching
      const nameMatch = (item.full_name || '').toLowerCase().includes(query);
      const companyMatch = (item.company_name || '').toLowerCase().includes(query);
      const emailMatch = (item.email || '').toLowerCase().includes(query);
      const phoneMatch = (item.phone || '').toLowerCase().includes(query);
      const searchMatch = !query || nameMatch || companyMatch || emailMatch || phoneMatch;

      // Type matching
      const typeMatch = !typeFilter || item.website_type === typeFilter;

      // Status matching
      const statusMatch = !statusFilter || item.status === statusFilter;

      return searchMatch && typeMatch && statusMatch;
    });

    this.renderTable();
  }

  resetFilters() {
    this.filterSearch.value = '';
    this.filterWebsiteType.value = '';
    this.filterStatus.value = '';
    this.applyFilters();
  }

  // --- TABLE RENDERING ---

  renderTable() {
    this.tableBody.innerHTML = '';

    if (this.filteredSubmissions.length === 0) {
      this.emptyState.style.display = 'block';
      return;
    }

    this.emptyState.style.display = 'none';

    this.filteredSubmissions.forEach(item => {
      const tr = document.createElement('tr');

      // Format date
      const dateObj = new Date(item.created_at || Date.now());
      const dateFormatted = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // WhatsApp format link
      let cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
      const waLink = `https://wa.me/${cleanPhone}`;

      tr.innerHTML = `
        <td style="font-size: 0.8rem; color: var(--navy-500); white-space: nowrap;">
          ${dateFormatted}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--navy-950);">${this.escapeHTML(item.full_name)}</div>
          <div style="font-size: 0.775rem; color: var(--navy-500);">${this.escapeHTML(item.company_name || 'Personal')}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem;">
            <a href="mailto:${item.email}" style="color: var(--accent); font-weight: 500;">${this.escapeHTML(item.email)}</a>
          </div>
          <div style="font-size: 0.775rem;">
            <a href="${waLink}" target="_blank" rel="noopener" style="color: #16a34a; font-weight: 600;">
              WA: ${this.escapeHTML(item.phone)}
            </a>
          </div>
        </td>
        <td>
          <span class="tag-badge">${this.escapeHTML(item.website_type)}</span>
        </td>
        <td style="font-size: 0.825rem; font-weight: 600; color: var(--navy-800);">
          ${this.escapeHTML(item.budget || '-')}
        </td>
        <td>
          <span class="status-pill ${item.status.replace(/\s+/g, '.')}" data-status="${item.status}">
            ● ${item.status}
          </span>
        </td>
        <td style="text-align: right;">
          <div class="action-buttons-wrap" style="justify-content: flex-end;">
            <button type="button" class="icon-btn" title="Lihat Detail Kebutuhan" onclick="window.adminApp.openDetailModal('${item.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button type="button" class="icon-btn danger" title="Hapus Pengajuan" onclick="window.adminApp.deleteSubmission('${item.id}', '${this.escapeHTML(item.full_name)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      this.tableBody.appendChild(tr);
    });
  }

  // --- DETAIL MODAL ---

  openDetailModal(id) {
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    this.selectedSubmission = item;
    this.modalClientName.textContent = item.full_name;
    this.modalSubId.textContent = `ID: ${item.id}`;
    this.modalUpdateStatus.value = item.status;

    // Features rendering
    let featuresHtml = '';
    const features = Array.isArray(item.required_features) ? item.required_features : [];
    if (features.length > 0) {
      featuresHtml = features.map(f => `<span class="tag-badge">${this.escapeHTML(f)}</span>`).join(' ');
    } else {
      featuresHtml = '<span style="color: var(--navy-400);">Tidak ada</span>';
    }

    // Target users
    let targetUsersHtml = '';
    const users = Array.isArray(item.target_users) ? item.target_users : [];
    if (users.length > 0) {
      targetUsersHtml = users.map(u => `<span class="tag-badge">${this.escapeHTML(u)}</span>`).join(' ');
    } else {
      targetUsersHtml = '<span style="color: var(--navy-400);">-</span>';
    }

    // Reference URL linkable
    let refUrlsHtml = '-';
    if (item.reference_url) {
      const urls = item.reference_url.split(/[,;\s]+/).filter(u => u.startsWith('http'));
      if (urls.length > 0) {
        refUrlsHtml = urls.map(u => `<a href="${u}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: underline; margin-right: 0.5rem;">${u}</a>`).join('');
      } else {
        refUrlsHtml = this.escapeHTML(item.reference_url);
      }
    }

    // Clean Phone
    let cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

    this.modalDetailContent.innerHTML = `
      <!-- Section A -->
      <div class="review-summary-card">
        <div class="review-section-header">
          <span>Section A &bull; Informasi Klien</span>
          <span class="status-pill ${item.status.replace(/\s+/g, '.')}">● ${item.status}</span>
        </div>
        <div class="review-grid">
          <div class="review-key">Nama Lengkap</div>
          <div class="review-value">${this.escapeHTML(item.full_name)}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Perusahaan / Brand</div>
          <div class="review-value">${this.escapeHTML(item.company_name || 'Personal')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Email</div>
          <div class="review-value">
            <a href="mailto:${item.email}" style="color: var(--accent);">${this.escapeHTML(item.email)}</a>
          </div>
        </div>
        <div class="review-grid">
          <div class="review-key">WhatsApp / Telepon</div>
          <div class="review-value">
            <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener" style="color: #16a34a; font-weight: 600;">
              💬 ${this.escapeHTML(item.phone)} (Buka WhatsApp Langsung)
            </a>
          </div>
        </div>
        <div class="review-grid">
          <div class="review-key">Bidang Usaha</div>
          <div class="review-value">${this.escapeHTML(item.business_field || '-')}</div>
        </div>
      </div>

      <!-- Section B & C -->
      <div class="review-summary-card">
        <div class="review-section-header">
          <span>Section B & C &bull; Spesifikasi Website & Fitur</span>
        </div>
        <div class="review-grid">
          <div class="review-key">Jenis Website</div>
          <div class="review-value"><strong>${this.escapeHTML(item.website_type)}</strong></div>
        </div>
        <div class="review-grid">
          <div class="review-key">Tujuan Utama</div>
          <div class="review-value">${this.escapeHTML(item.website_goal || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Deskripsi Kebutuhan</div>
          <div class="review-value" style="white-space: pre-line; line-height: 1.6;">${this.escapeHTML(item.project_description || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Fitur Dibutuhkan</div>
          <div class="review-value">
            <div class="tags-list">${featuresHtml}</div>
          </div>
        </div>
      </div>

      <!-- Section D -->
      <div class="review-summary-card">
        <div class="review-section-header">
          <span>Section D &bull; Target Pengguna & Kesiapan Konten</span>
        </div>
        <div class="review-grid">
          <div class="review-key">Target Pengguna</div>
          <div class="review-value">
            <div class="tags-list">${targetUsersHtml}</div>
          </div>
        </div>
        <div class="review-grid">
          <div class="review-key">Kesiapan Konten</div>
          <div class="review-value">${this.escapeHTML(item.content_status || '-')}</div>
        </div>
      </div>

      <!-- Section E & F -->
      <div class="review-summary-card">
        <div class="review-section-header">
          <span>Section E & F &bull; Desain, Budget & Timeline</span>
        </div>
        <div class="review-grid">
          <div class="review-key">Preferensi Desain</div>
          <div class="review-value">${this.escapeHTML(item.design_style || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Referensi Website</div>
          <div class="review-value">${refUrlsHtml}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Estimasi Budget</div>
          <div class="review-value" style="color: #0369a1; font-weight: 700;">${this.escapeHTML(item.budget || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Target Deadline</div>
          <div class="review-value">${this.escapeHTML(item.deadline || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Domain & Hosting</div>
          <div class="review-value">${this.escapeHTML(item.domain_status || '-')}</div>
        </div>
        <div class="review-grid">
          <div class="review-key">Catatan Tambahan</div>
          <div class="review-value" style="white-space: pre-line;">${this.escapeHTML(item.additional_notes || '-')}</div>
        </div>
      </div>
    `;

    this.detailModal.classList.add('active');
  }

  closeDetailModal() {
    this.detailModal.classList.remove('active');
    this.selectedSubmission = null;
  }

  async saveStatusFromModal() {
    if (!this.selectedSubmission) return;

    const newStatus = this.modalUpdateStatus.value;
    const id = this.selectedSubmission.id;

    this.btnSaveStatus.disabled = true;
    this.btnSaveStatus.textContent = 'Menyimpan...';

    try {
      const res = await window.crmSupabase.updateStatus(id, newStatus);
      if (res.success) {
        this.selectedSubmission.status = newStatus;
        const index = this.submissions.findIndex(s => s.id === id);
        if (index !== -1) {
          this.submissions[index].status = newStatus;
        }
        this.computeStats();
        this.applyFilters();
        this.showToast(`Status pengajuan berhasil diubah menjadi: ${newStatus}`, 'success');
        this.closeDetailModal();
      }
    } catch (err) {
      console.error(err);
      this.showToast('Gagal mengubah status pengajuan.', 'error');
    } finally {
      this.btnSaveStatus.disabled = false;
      this.btnSaveStatus.textContent = 'Simpan Status';
    }
  }

  // --- DELETE SUBMISSION ---

  async deleteSubmission(id, name) {
    if (confirm(`Apakah Anda yakin ingin menghapus data pengajuan dari "${name}"?\nTindakan ini tidak dapat dibatalkan.`)) {
      try {
        const res = await window.crmSupabase.deleteSubmission(id);
        if (res.success) {
          this.submissions = this.submissions.filter(s => s.id !== id);
          this.computeStats();
          this.applyFilters();
          this.showToast('Pengajuan berhasil dihapus.', 'info');
        }
      } catch (err) {
        console.error(err);
        this.showToast('Gagal menghapus pengajuan.', 'error');
      }
    }
  }

  // --- EXPORT TO CSV (AD-12) ---

  exportCSV() {
    if (this.submissions.length === 0) {
      this.showToast('Tidak ada data pengajuan untuk diekspor.', 'error');
      return;
    }

    const headers = [
      "ID",
      "Waktu Pengajuan",
      "Nama Klien",
      "Perusahaan",
      "Email",
      "Telepon",
      "Bidang Usaha",
      "Jenis Website",
      "Tujuan Website",
      "Deskripsi Proyek",
      "Fitur Dibutuhkan",
      "Target Pengguna",
      "Kesiapan Konten",
      "Gaya Desain",
      "Referensi Desain",
      "Budget",
      "Deadline",
      "Status Domain",
      "Status Pengajuan",
      "Catatan Tambahan"
    ];

    const rows = this.submissions.map(item => [
      item.id,
      item.created_at,
      item.full_name,
      item.company_name || '',
      item.email,
      item.phone,
      item.business_field || '',
      item.website_type,
      item.website_goal || '',
      item.project_description || '',
      Array.isArray(item.required_features) ? item.required_features.join(', ') : '',
      Array.isArray(item.target_users) ? item.target_users.join(', ') : '',
      item.content_status || '',
      item.design_style || '',
      item.reference_url || '',
      item.budget || '',
      item.deadline || '',
      item.domain_status || '',
      item.status,
      item.additional_notes || ''
    ]);

    // Escape CSV cell values
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Trigger download with UTF-8 BOM
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_requirements_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Data berhasil diekspor ke CSV.', 'success');
  }

  // --- SETTINGS MODAL ---

  openSettingsModal() {
    this.settingSupabaseUrl.value = localStorage.getItem('crm_supabase_url') || '';
    this.settingSupabaseKey.value = localStorage.getItem('crm_supabase_key') || '';
    this.settingsModal.classList.add('active');
  }

  closeSettingsModal() {
    this.settingsModal.classList.remove('active');
  }

  handleSaveSettings(e) {
    e.preventDefault();
    const url = this.settingSupabaseUrl.value.trim();
    const key = this.settingSupabaseKey.value.trim();

    if (!url || !key) {
      this.showToast('Harap isi URL dan Anon Key Supabase Anda.', 'error');
      return;
    }

    window.crmSupabase.saveConfig(url, key);
    this.updateBackendStatusBadge();
    this.closeSettingsModal();
    this.showToast('Koneksi Supabase tersimpan! Memuat data...', 'success');
    this.loadData();
  }

  handleResetSettings() {
    window.crmSupabase.resetConfig();
    this.updateBackendStatusBadge();
    this.closeSettingsModal();
    this.showToast('Kembali ke mode Demo / Local Storage.', 'info');
    this.loadData();
  }

  updateBackendStatusBadge() {
    if (window.crmSupabase.isConfigured()) {
      this.backendStatusBadge.className = 'status-pill Completed';
      this.backendStatusBadge.textContent = '● Supabase Terhubung';
    } else {
      this.backendStatusBadge.className = 'status-pill Pending';
      this.backendStatusBadge.textContent = '● Demo Mode (Lokal)';
    }
  }

  // --- UTILS ---

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});
