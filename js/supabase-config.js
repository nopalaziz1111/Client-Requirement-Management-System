/**
 * Client Requirement Management System
 * Supabase Client & Data Layer
 * Supports live Supabase integration and offline/demo fallback mode.
 */

// Default configuration keys (Can be configured via UI Settings or directly here)
const DEFAULT_SUPABASE_CONFIG = {
  url: localStorage.getItem('crm_supabase_url') || '',
  key: localStorage.getItem('crm_supabase_key') || '',
  demoMode: localStorage.getItem('crm_demo_mode') === 'true' || !localStorage.getItem('crm_supabase_url')
};

// Initial Mock Seed Data (Matching schema.sql)
const SEED_SUBMISSIONS = [
  {
    id: "e4a2b1c8-8921-4d99-a1b7-1c6e4e58b001",
    full_name: "Budi Pratama",
    company_name: "PT Sinergi Mandiri Abadi",
    email: "budi.pratama@sinergi.co.id",
    phone: "+6281234567890",
    business_field: "Logistik & Distribusi",
    website_type: "Company Profile",
    website_goal: "Meningkatkan kredibilitas perusahaan dan menarik calon mitra korporasi baru.",
    project_description: "Kami membutuhkan website profil perusahaan modern dengan halaman katalog layanan armada, profil direksi, formulir penawaran harga kerjasama, dan integrasi WhatsApp CS.",
    required_features: ["Dashboard administrator", "Contact form", "WhatsApp integration", "File upload", "Reporting & PDF export"],
    target_users: ["Perusahaan B2B", "Manajer Logistik", "Mitra Pengadaan / Procurement"],
    content_status: "Sudah siap lengkap (Company profile PDF & foto aset tersedia)",
    design_style: "Corporate",
    reference_url: "https://stripe.com, https://dhl.com",
    budget: "Rp 15.000.000 - Rp 25.000.000",
    deadline: "1 - 2 Bulan",
    domain_status: "Sudah punya domain & hosting",
    additional_notes: "Mohon dibuatkan fitur multi-bahasa (ID & EN) jika budget mencukupi.",
    status: "Pending",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: "b7f9104a-7140-4212-9cbb-92dd38fa0002",
    full_name: "Siti Rahmawati",
    company_name: "Aura Hijab Boutique",
    email: "siti.rahma@auraboutique.com",
    phone: "+6285712349988",
    business_field: "Retail Fashion Muslimah",
    website_type: "E-Commerce",
    website_goal: "Meningkatkan omzet penjualan online langsung tanpa bergantung sepenuhnya pada marketplace pihak ketiga.",
    project_description: "Website toko online busana muslimah dengan fitur keranjang belanja, integrasi payment gateway Midtrans, perhitungan ongkos kirim otomatis RajaOngkir, dan voucher diskon berkala.",
    required_features: ["Login dan registrasi", "Dashboard administrator", "CRUD data", "Search dan filter", "Online payment", "Shopping cart", "Product management", "Notification"],
    target_users: ["Wanita usia 20-45 tahun", "Komunitas hijabers", "Pelanggan ritel online"],
    content_status: "Sebagian siap (Foto produk katalog sudah ada, deskripsi teks butuh revisi)",
    design_style: "Elegant",
    reference_url: "https://cottonink.co.id, https://buttonscarves.com",
    budget: "Rp 25.000.000 - Rp 40.000.000",
    deadline: "2 - 3 Bulan",
    domain_status: "Baru punya domain, butuh hosting cloud",
    additional_notes: "Harus mobile-first karena 85% calon pembeli datang dari feed Instagram dan TikTok Shop.",
    status: "In Progress",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: "c18f3a5e-9981-42cb-b1b0-98df71900003",
    full_name: "Dr. Hendra Gunawan",
    company_name: "Klinik Sehat Medika",
    email: "hendra.g@sehatmedika.com",
    phone: "+6281909876543",
    business_field: "Kesehatan & Medis",
    website_type: "Booking System",
    website_goal: "Mempermudah pasien melakukan reservasi janji temu dokter spesialis secara mandiri dan transparan.",
    project_description: "Sistem reservasi jadwal konsultasi dokter spesialis klinik kami dengan kalender interaktif, kuota per sesi, notifikasi WhatsApp pengingat janji temu, dan portal rekap kunjungan.",
    required_features: ["Login dan registrasi", "Dashboard administrator", "CRUD data", "Search dan filter", "WhatsApp integration", "Notification", "Reporting & PDF export"],
    target_users: ["Pasien umum", "Keluarga pasien", "Staf resepsionis klinik"],
    content_status: "Sudah siap lengkap",
    design_style: "Modern minimalis",
    reference_url: "https://halodoc.com, https://alodokter.com",
    budget: "Rp 20.000.000 - Rp 35.000.000",
    deadline: "1 Bulan",
    domain_status: "Belum punya sama sekali (butuh rekomendasi domain .id dan server)",
    additional_notes: "Prioritaskan kemudahan navigasi bagi pengguna lanjut usia dan kecepatan akses.",
    status: "Reviewing",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: "f83b27ae-629b-4e10-b992-aa2286400004",
    full_name: "Fajar Nugroho, M.Pd",
    company_name: "Sekolah Alam Kreatif",
    email: "info@sekolahalamkreatif.sch.id",
    phone: "+6281399887766",
    business_field: "Pendidikan & Akademik",
    website_type: "Education Website",
    website_goal: "Penerimaan Peserta Didik Baru (PPDB Online) dan etalase kegiatan belajar siswa.",
    project_description: "Portal sekolah ramah anak dengan formulir pendaftaran siswa baru, upload berkas rapor & akta, kalender akademik, dan portal pengumuman seleksi.",
    required_features: ["Dashboard administrator", "CRUD data", "Search dan filter", "Contact form", "File upload", "Reporting & PDF export"],
    target_users: ["Orang tua calon murid", "Guru & staf sekolah", "Masyarakat umum"],
    content_status: "Sudah siap lengkap",
    design_style: "Colorful",
    reference_url: "https://zenius.net",
    budget: "Rp 10.000.000 - Rp 15.000.000",
    deadline: "3 - 4 Minggu",
    domain_status: "Sudah punya domain .sch.id",
    additional_notes: "Proyek sudah selesai diuji coba dan pelatihan admin selesai dilaksanakan.",
    status: "Completed",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

class SupabaseService {
  constructor() {
    this.client = null;
    this.config = { ...DEFAULT_SUPABASE_CONFIG };
    this.init();
  }

  init() {
    if (this.config.url && this.config.key && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.key);
        console.log("Supabase client initialized successfully with remote endpoint.");
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        this.client = null;
      }
    } else {
      console.log("Running in Mock/Demo Storage Mode. Connect Supabase in Settings to sync with PostgreSQL.");
    }

    // Ensure mock storage exists if needed
    if (!localStorage.getItem('crm_local_submissions')) {
      localStorage.setItem('crm_local_submissions', JSON.stringify(SEED_SUBMISSIONS));
    }
  }

  isConfigured() {
    return Boolean(this.client && this.config.url && this.config.key);
  }

  saveConfig(url, key) {
    this.config.url = url.trim();
    this.config.key = key.trim();
    localStorage.setItem('crm_supabase_url', this.config.url);
    localStorage.setItem('crm_supabase_key', this.config.key);
    this.init();
  }

  resetConfig() {
    localStorage.removeItem('crm_supabase_url');
    localStorage.removeItem('crm_supabase_key');
    this.config.url = '';
    this.config.key = '';
    this.client = null;
  }

  // Generate UUID v4
  generateUUID() {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // --- SUBMISSIONS CRUD ---

  async createSubmission(payload) {
    const formattedData = {
      ...payload,
      id: this.generateUUID(),
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('submissions')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.warn("Supabase insert error, falling back to local storage:", err);
      }
    }

    // Local Storage Fallback
    const list = this.getLocalSubmissions();
    list.unshift(formattedData);
    this.setLocalSubmissions(list);
    return { success: true, data: formattedData, isLocal: true };
  }

  async getSubmissions() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
      } catch (err) {
        console.warn("Supabase fetch error, fallback to local:", err);
      }
    }

    return { success: true, data: this.getLocalSubmissions(), isLocal: true };
  }

  async updateStatus(id, newStatus) {
    const validStatuses = ['Pending', 'Reviewing', 'In Progress', 'Completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updatedAt = new Date().toISOString();

    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('submissions')
          .update({ status: newStatus, updated_at: updatedAt })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.warn("Supabase update error, fallback to local:", err);
      }
    }

    // Local fallback
    const list = this.getLocalSubmissions();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index].status = newStatus;
      list[index].updated_at = updatedAt;
      this.setLocalSubmissions(list);
      return { success: true, data: list[index], isLocal: true };
    }
    throw new Error("Submission not found in local records");
  }

  async deleteSubmission(id) {
    if (this.isConfigured()) {
      try {
        const { error } = await this.client
          .from('submissions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.warn("Supabase delete error, fallback to local:", err);
      }
    }

    // Local fallback
    let list = this.getLocalSubmissions();
    list = list.filter(item => item.id !== id);
    this.setLocalSubmissions(list);
    return { success: true, isLocal: true };
  }

  // --- AUTHENTICATION ---

  async login(email, password) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        if (error) throw error;
        localStorage.setItem('crm_admin_logged_in', 'true');
        return { success: true, user: data.user, session: data.session };
      } catch (err) {
        return { success: false, error: err.message || 'Login gagal' };
      }
    }

    // Demo Mode Auth
    if (email === 'admin@clientrequirements.com' && password === 'admin123') {
      localStorage.setItem('crm_admin_logged_in', 'true');
      return {
        success: true,
        user: { email: 'admin@clientrequirements.com', role: 'administrator' },
        isDemo: true
      };
    }

    return {
      success: false,
      error: 'Email atau password salah. (Untuk demo mode gunakan: admin@clientrequirements.com / admin123)'
    };
  }

  async logout() {
    if (this.isConfigured() && this.client.auth) {
      try {
        await this.client.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    localStorage.removeItem('crm_admin_logged_in');
    return { success: true };
  }

  isAdminAuthenticated() {
    return localStorage.getItem('crm_admin_logged_in') === 'true';
  }

  // --- LOCAL REPO HELPERS ---

  getLocalSubmissions() {
    const raw = localStorage.getItem('crm_local_submissions');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  setLocalSubmissions(list) {
    localStorage.setItem('crm_local_submissions', JSON.stringify(list));
  }

  resetLocalData() {
    localStorage.setItem('crm_local_submissions', JSON.stringify(SEED_SUBMISSIONS));
  }
}

// Global instance
window.crmSupabase = new SupabaseService();
