-- ==============================================================================
-- Client Requirement Management System - Supabase PostgreSQL Schema
-- Version: 1.0
-- ==============================================================================

-- 1. Enable UUID Extension (standard in PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create 'submissions' table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    business_field TEXT,
    website_type TEXT NOT NULL,
    website_goal TEXT,
    project_description TEXT,
    required_features JSONB DEFAULT '[]'::jsonb,
    target_users JSONB DEFAULT '[]'::jsonb,
    content_status TEXT,
    design_style TEXT,
    reference_url TEXT,
    budget TEXT,
    deadline TEXT,
    domain_status TEXT,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewing', 'In Progress', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Trigger to auto-update 'updated_at' on record changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_submissions_updated_at ON public.submissions;
CREATE TRIGGER trigger_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Policy 1: Anyone (including unauthenticated client) can submit a new requirement form
DROP POLICY IF EXISTS "Public clients can insert submissions" ON public.submissions;
CREATE POLICY "Public clients can insert submissions"
    ON public.submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 2: Only authenticated administrators can read/select all submissions
DROP POLICY IF EXISTS "Authenticated admins can view submissions" ON public.submissions;
CREATE POLICY "Authenticated admins can view submissions"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Only authenticated administrators can update submission status or data
DROP POLICY IF EXISTS "Authenticated admins can update submissions" ON public.submissions;
CREATE POLICY "Authenticated admins can update submissions"
    ON public.submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Only authenticated administrators can delete submissions
DROP POLICY IF EXISTS "Authenticated admins can delete submissions" ON public.submissions;
CREATE POLICY "Authenticated admins can delete submissions"
    ON public.submissions
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. Sample Initial Data for Testing & Demo (Optional)
INSERT INTO public.submissions (
    full_name, company_name, email, phone, business_field,
    website_type, website_goal, project_description,
    required_features, target_users, content_status,
    design_style, reference_url, budget, deadline, domain_status,
    status, additional_notes
) VALUES
(
    'Budi Pratama',
    'PT Sinergi Mandiri Abadi',
    'budi.pratama@sinergi.co.id',
    '+6281234567890',
    'Logistik & Distribusi',
    'Company Profile',
    'Meningkatkan kredibilitas perusahaan dan menarik calon mitra korporasi baru.',
    'Kami membutuhkan website profil perusahaan modern dengan halaman katalog layanan armada, profil direksi, formulir penawaran harga kerjasama, dan integrasi WhatsApp CS.',
    '["Dashboard administrator", "Contact form", "WhatsApp integration", "File upload", "Reporting & PDF export"]'::jsonb,
    '["Perusahaan B2B", "Manajer Logistik", "Mitra Pengadaan / Procurement"]'::jsonb,
    'Sudah siap lengkap (Company profile PDF & foto aset tersedia)',
    'Corporate & Modern Minimalist',
    'https://stripe.com, https://dhl.com',
    'Rp 15.000.000 - Rp 25.000.000',
    '1 - 2 Bulan',
    'Sudah punya domain & hosting',
    'Pending',
    'Mohon dibuatkan fitur multi-bahasa (ID & EN) jika budget mencukupi.'
),
(
    'Siti Rahmawati',
    'Aura Hijab Boutique',
    'siti.rahma@auraboutique.com',
    '+6285712349988',
    'Retail Fashion Muslimah',
    'E-Commerce',
    'Meningkatkan omzet penjualan online langsung tanpa bergantung sepenuhnya pada marketplace.',
    'Website toko online untuk busana muslimah dengan fitur keranjang belanja, integrasi payment gateway Midtrans, perhitungan ongkir otomatis RajaOngkir, dan promo voucher.',
    '["Login dan registrasi", "Dashboard administrator", "CRUD data", "Search dan filter", "Online payment", "Shopping cart", "Product management", "Notification"]'::jsonb,
    '["Wanita usia 20-45 tahun", "Komunitas hijabers", "Pelanggan ritel online"]'::jsonb,
    'Sebagian siap (Foto produk katalog sudah ada, teks deskripsi butuh bantuan)',
    'Elegant & Minimalist Pastel',
    'https://cottonink.co.id, https://buttonscarves.com',
    'Rp 25.000.000 - Rp 40.000.000',
    '2 - 3 Bulan',
    'Baru punya domain, butuh hosting cloud',
    'In Progress',
    'Harus mobile-first karena 85% traffic kami datang dari Instagram & TikTok.'
),
(
    'Dr. Hendra Gunawan',
    'Klinik Sehat Medika',
    'hendra.g@sehatmedika.com',
    '+6281909876543',
    'Kesehatan & Medis',
    'Booking System',
    'Mempermudah pasien melakukan janji temu dengan dokter spesialis secara online dan mengurangi antrean di klinik.',
    'Sistem reservasi jadwal konsultasi dokter spesialis dengan kalender interaktif, pengingat otomatis via WhatsApp, dan riwayat kunjungan pasien.',
    '["Login dan registrasi", "Dashboard administrator", "CRUD data", "Search dan filter", "WhatsApp integration", "Notification", "Reporting & PDF export"]'::jsonb,
    '["Pasien umum", "Keluarga pasien", "Staf resepsionis klinik"]'::jsonb,
    'Sudah siap lengkap',
    'Clean, Medical Modern Blue & White',
    'https://halodoc.com, https://alodokter.com',
    'Rp 20.000.000 - Rp 35.000.000',
    '1 Bulan',
    'Belum punya sama sekali (butuh rekomendasi domain .id dan server)',
    'Reviewing',
    'Prioritaskan kecepatan loading pada koneksi 4G mobile.'
),
(
    'Fajar Nugroho',
    'Sekolah Alam Kreatif',
    'info@sekolahalamkreatif.sch.id',
    '+6281399887766',
    'Pendidikan',
    'Education Website',
    'Penerimaan Peserta Didik Baru (PPDB Online) dan portal informasi kegiatan akademik siswa.',
    'Website sekolah ramah anak dengan formulir pendaftaran siswa baru, upload berkas rapor & akta, serta pengumuman hasil seleksi.',
    '["Dashboard administrator", "CRUD data", "Search dan filter", "Contact form", "File upload", "Reporting & PDF export"]'::jsonb,
    '["Orang tua calon murid", "Guru & staf sekolah", "Masyarakat umum"]'::jsonb,
    'Sudah siap lengkap',
    'Colorful yet Modern Minimalist',
    'https://zenius.net',
    'Rp 10.000.000 - Rp 15.000.000',
    '3 - 4 Minggu',
    'Sudah punya domain .sch.id',
    'Completed',
    'Proyek telah serah terima dan pelatihan admin sudah selesai dilaksanakan.'
);
