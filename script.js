// ============================================
// HOW MUCH FOR SOLAR -- FORM HANDLER
// TODO: Update BACKEND_URL and contact email once domain/deployment confirmed
// ============================================

const BACKEND_URL = 'https://YOUR-RAILWAY-APP.up.railway.app'; // <-- Update after deployment

const form            = document.getElementById('quote-form');
const submitBtn       = document.getElementById('submit-btn');
const btnText         = document.getElementById('btn-text');
const btnLoading      = document.getElementById('btn-loading');
const formCard        = document.getElementById('quote-form-card');
const successMsg      = document.getElementById('success-message');
const billAttachments = document.getElementById('bill_attachments');

// Limit file attachments to 3
billAttachments.addEventListener('change', () => {
  if (billAttachments.files.length > 3) {
    showError('Please attach a maximum of 3 bills.');
    billAttachments.value = '';
  }
});

// Smooth scroll to form when CTA buttons are clicked
document.querySelectorAll('a[href="#quote-form-card"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      document.getElementById('first_name').focus();
    }, 600);
  });
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Remove any previous error message
  const existingError = form.querySelector('.error-message');
  if (existingError) existingError.remove();

  // Require at least bill amount OR uploaded bill
  const billAmount = document.getElementById('electricity_bill').value;
  const billFiles  = billAttachments.files.length;
  if (!billAmount && billFiles === 0) {
    showError('Please select your monthly bill amount or upload a recent bill.');
    return;
  }

  const formData = new FormData();
  formData.append('first_name',        document.getElementById('first_name').value.trim());
  formData.append('last_name',         document.getElementById('last_name').value.trim());
  formData.append('email',             document.getElementById('email').value.trim());
  formData.append('phone',             document.getElementById('phone').value.trim());
  formData.append('no_direct_contact', document.getElementById('no_direct_contact').checked ? 'true' : 'false');
  formData.append('address',           document.getElementById('address').value.trim());
  formData.append('suburb',            document.getElementById('suburb').value.trim());
  formData.append('state',             document.getElementById('state').value);
  formData.append('electricity_bill',  billAmount);
  formData.append('num_installers',    document.getElementById('num_installers').value);
  formData.append('source',            'website');
  formData.append('utm_source',        getParam('utm_source'));
  formData.append('utm_medium',        getParam('utm_medium'));
  formData.append('utm_campaign',      getParam('utm_campaign'));

  // Attach bill files
  for (let i = 0; i < Math.min(billFiles, 3); i++) {
    formData.append('bill_attachments', billAttachments.files[i]);
  }

  setLoading(true);

  try {
    const response = await fetch(`${BACKEND_URL}/leads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    // Success
    formCard.style.display = 'none';
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Fire Meta Pixel lead event if pixel is installed
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }

  } catch (err) {
    console.error('Form submission error:', err);
    // TODO: Update contact email once domain confirmed
    showError('Something went wrong. Please try again or email us at hello@howmuchforsolar.com.au');
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.style.display    = isLoading ? 'none'   : 'inline';
  btnLoading.style.display = isLoading ? 'inline' : 'none';
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.display = 'block';
  errorDiv.textContent = message;
  form.insertBefore(errorDiv, submitBtn);
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}
