/**
 * Client Requirement Management System - Client Application Logic
 */

class FormApp {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 7;
    this.customFeatures = [];

    this.cacheElements();
    this.bindEvents();
    this.updateUI();
  }

  cacheElements() {
    this.form = document.getElementById('requirement-form');
    this.progressBar = document.getElementById('progress-bar');
    this.stepNavItems = document.querySelectorAll('#stepper-nav .step-item');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnSubmit = document.getElementById('btn-submit');
    this.stepperControls = document.getElementById('stepper-controls');
    this.successScreen = document.getElementById('success-screen');
    
    // Custom feature controls
    this.customFeatureInput = document.getElementById('custom_feature_input');
    this.btnAddFeature = document.getElementById('btn-add-feature');
    this.customFeaturesContainer = document.getElementById('custom-features-badge-container');

    // Option cards selection styling
    this.optionCards = document.querySelectorAll('.option-card');
    this.chipCheckboxes = document.querySelectorAll('.chip-checkbox');
  }

  bindEvents() {
    // Next & Prev buttons
    this.btnNext.addEventListener('click', () => this.handleNext());
    this.btnPrev.addEventListener('click', () => this.handlePrev());

    // Click on Stepper nav
    this.stepNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetStep = parseInt(item.getAttribute('data-step'), 10);
        if (targetStep < this.currentStep) {
          this.goToStep(targetStep);
        } else if (targetStep > this.currentStep) {
          if (this.validateCurrentStep()) {
            this.goToStep(targetStep);
          }
        }
      });
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Custom feature addition
    this.btnAddFeature.addEventListener('click', () => this.addCustomFeature());
    this.customFeatureInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addCustomFeature();
      }
    });

    // Option Cards click sync
    this.optionCards.forEach(card => {
      const input = card.querySelector('input');
      card.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
        this.updateCardSelections();
      });
    });

    // Chip checkboxes toggle class
    this.chipCheckboxes.forEach(chip => {
      const input = chip.querySelector('input');
      input.addEventListener('change', () => {
        chip.classList.toggle('checked', input.checked);
      });
    });

    // Start form scroll button
    const btnStart = document.getElementById('btn-start-form');
    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Fill again button
    const btnFillAgain = document.getElementById('btn-fill-again');
    if (btnFillAgain) {
      btnFillAgain.addEventListener('click', () => {
        this.form.reset();
        this.customFeatures = [];
        this.renderCustomFeatures();
        this.successScreen.style.display = 'none';
        this.form.style.display = 'block';
        this.stepperControls.style.display = 'flex';
        this.goToStep(1);
      });
    }

    // Input clearing errors on type
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
      });
    });
  }

  updateCardSelections() {
    this.optionCards.forEach(card => {
      const input = card.querySelector('input');
      card.classList.toggle('selected', input.checked);
    });
  }

  addCustomFeature() {
    const val = this.customFeatureInput.value.trim();
    if (!val) return;
    if (this.customFeatures.includes(val)) {
      this.showToast('Fitur ini sudah ditambahkan', 'error');
      return;
    }
    this.customFeatures.push(val);
    this.customFeatureInput.value = '';
    this.renderCustomFeatures();
  }

  removeCustomFeature(index) {
    this.customFeatures.splice(index, 1);
    this.renderCustomFeatures();
  }

  renderCustomFeatures() {
    this.customFeaturesContainer.innerHTML = '';
    this.customFeatures.forEach((feat, idx) => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.style.display = 'inline-flex';
      badge.style.alignItems = 'center';
      badge.style.gap = '0.35rem';
      badge.innerHTML = `
        ${feat}
        <span style="cursor: pointer; font-weight: bold; margin-left: 2px;">&times;</span>
      `;
      badge.querySelector('span').addEventListener('click', () => this.removeCustomFeature(idx));
      this.customFeaturesContainer.appendChild(badge);
    });
  }

  handleNext() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);
      }
    }
  }

  handlePrev() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  goToStep(step) {
    // Hide current step
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    
    // Show target step
    const targetEl = document.getElementById(`step-${step}`);
    if (targetEl) targetEl.classList.add('active');

    this.currentStep = step;
    this.updateUI();

    // Scroll to top of form smoothly
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // If reaching Review Step (7), compile summary
    if (this.currentStep === 7) {
      this.compileReviewSummary();
    }
  }

  updateUI() {
    // Update Stepper Nav
    this.stepNavItems.forEach(item => {
      const step = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active', 'completed');
      if (step === this.currentStep) {
        item.classList.add('active');
      } else if (step < this.currentStep) {
        item.classList.add('completed');
      }
    });

    // Update Progress Bar
    const progressPercent = Math.round((this.currentStep / this.totalSteps) * 100);
    this.progressBar.style.width = `${progressPercent}%`;

    // Button states
    this.btnPrev.disabled = this.currentStep === 1;

    if (this.currentStep === this.totalSteps) {
      this.btnNext.style.display = 'none';
      this.btnSubmit.style.display = 'inline-flex';
    } else {
      this.btnNext.style.display = 'inline-flex';
      this.btnSubmit.style.display = 'none';
    }

    this.updateCardSelections();
  }

  validateCurrentStep() {
    let isValid = true;
    const currentStepEl = document.getElementById(`step-${this.currentStep}`);
    const requiredInputs = currentStepEl.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
      // Validate radio groups
      if (input.type === 'radio') {
        const name = input.name;
        const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
          isValid = false;
        }
      } else if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim() || !emailRegex.test(input.value.trim())) {
          input.classList.add('error');
          isValid = false;
        } else {
          input.classList.remove('error');
        }
      } else {
        if (!input.value.trim()) {
          input.classList.add('error');
          isValid = false;
        } else {
          input.classList.remove('error');
        }
      }
    });

    if (!isValid) {
      this.showToast('Mohon lengkapi semua bidang wajib (*) sebelum melanjutkan.', 'error');
    }

    return isValid;
  }

  compileReviewSummary() {
    const formData = this.getFormData();

    document.getElementById('rev-full-name').textContent = formData.full_name || '-';
    document.getElementById('rev-company').textContent = formData.company_name || 'Personal / Belum ada PT';
    document.getElementById('rev-contact').textContent = `${formData.email} • ${formData.phone}`;
    document.getElementById('rev-business').textContent = formData.business_field || '-';

    document.getElementById('rev-website-type').textContent = formData.website_type || '-';
    document.getElementById('rev-website-goal').textContent = formData.website_goal || '-';
    document.getElementById('rev-project-desc').textContent = formData.project_description || '-';

    // Features tags
    const featuresListContainer = document.getElementById('rev-features-list');
    featuresListContainer.innerHTML = '';
    const allFeatures = [...(formData.required_features || []), ...this.customFeatures];

    if (allFeatures.length === 0) {
      featuresListContainer.innerHTML = '<span style="color: var(--navy-400);">Tidak ada fitur spesifik dipilih</span>';
    } else {
      allFeatures.forEach(feat => {
        const tag = document.createElement('span');
        tag.className = 'tag-badge';
        tag.textContent = feat;
        featuresListContainer.appendChild(tag);
      });
    }

    document.getElementById('rev-design-style').textContent = formData.design_style || '-';
    document.getElementById('rev-reference-url').textContent = formData.reference_url || 'Tidak ada referensi khusus';
    document.getElementById('rev-budget').textContent = formData.budget || '-';
    document.getElementById('rev-deadline').textContent = formData.deadline || '-';
    document.getElementById('rev-domain').textContent = formData.domain_status || '-';
  }

  getFormData() {
    const data = {};
    const formData = new FormData(this.form);

    data.full_name = formData.get('full_name') || '';
    data.company_name = formData.get('company_name') || '';
    data.email = formData.get('email') || '';
    data.phone = formData.get('phone') || '';
    data.business_field = formData.get('business_field') || '';

    data.website_type = formData.get('website_type') || '';
    data.website_goal = formData.get('website_goal') || '';
    data.project_description = formData.get('project_description') || '';

    // Multiple checkboxes for features
    data.required_features = [
      ...formData.getAll('required_features'),
      ...this.customFeatures
    ];

    // Multiple checkboxes for target users
    data.target_users = formData.getAll('target_users');

    data.content_status = formData.get('content_status') || '';
    data.design_style = formData.get('design_style') || '';
    data.reference_url = formData.get('reference_url') || '';
    data.budget = formData.get('budget') || '';
    data.deadline = formData.get('deadline') || '';
    data.domain_status = formData.get('domain_status') || '';
    
    // Notes
    const notes = [];
    if (formData.get('domain_name_plan')) {
      notes.push(`Rencana Domain: ${formData.get('domain_name_plan')}`);
    }
    if (formData.get('color_palette')) {
      notes.push(`Warna Pilihan: ${formData.get('color_palette')}`);
    }
    if (formData.get('cms_need')) {
      notes.push(`Kebutuhan CMS: ${formData.get('cms_need')}`);
    }
    if (formData.get('design_notes')) {
      notes.push(`Catatan Desain: ${formData.get('design_notes')}`);
    }
    if (formData.get('additional_notes')) {
      notes.push(`Catatan Tambahan: ${formData.get('additional_notes')}`);
    }
    data.additional_notes = notes.join('\n');

    return data;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateCurrentStep()) return;

    const payload = this.getFormData();
    
    // Disable submit button and show loading indicator
    this.btnSubmit.disabled = true;
    this.btnSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Mengirimkan Kebutuhan...
    `;

    try {
      const res = await window.crmSupabase.createSubmission(payload);
      if (res.success) {
        // Show success screen (CL-14)
        this.form.style.display = 'none';
        this.stepperControls.style.display = 'none';
        this.successScreen.style.display = 'block';

        document.getElementById('success-client-name').textContent = payload.full_name;
        document.getElementById('success-submission-id').textContent = res.data.id || 'SUB-' + Date.now();

        this.showToast('Pengajuan kebutuhan berhasil terkirim!', 'success');
        document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error(res.error || 'Terjadi kendala saat mengirimkan formulir.');
      }
    } catch (err) {
      console.error(err);
      this.showToast(err.message || 'Gagal mengirim pengajuan. Silakan coba lagi.', 'error');
    } finally {
      this.btnSubmit.disabled = false;
      this.btnSubmit.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Kirimkan Kebutuhan Website
      `;
    }
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
  window.formApp = new FormApp();
});
