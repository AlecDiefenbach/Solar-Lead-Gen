// ============================================
// MY SOLAR REPORT — FORM HANDLER
// ============================================
// This script submits the form to the Python backend.
// Update BACKEND_URL before deploying.
// ============================================

const BACKEND_URL = 'https://YOUR-RAILWAY-APP.up.railway.app'; // <-- Update this after deployment

const form = document.getElementById('quote-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const formCard = document.getElementById('quote-form-card');
const successMsg = document.getElementById('success-message');
const phoneOptIn = document.getElementById('phone_opt_in');
const phoneField = document.getElementById('phone-field');
const billAttachments = document.getElementById('bill_attachments');

// Show/hide phone number field based on opt-in checkbox
phoneOptIn.addEventListener('change', () => {
  phoneField.style.display = phoneOptIn.checked ? 'block' : 'none';
  if (!phoneOptIn.checked) {
    document.getElementById('phone').value = '';
  }
});

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

  // Remove any previous error
  const existingError = form.querySelector('.error-message');
  if (existingError) existingError.remove();

  // Build FormData (handles both text fields and file uploads)
  const formData = new FormData();
  formData.append('first_name',       document.getElementById('first_name').value.trim());
  formData.append('last_name',        document.getElementById('last_name').value.trim());
  formData.append('email',            document.getElementById('email').value.trim());
  formData.append('phone_opt_in',     phoneOptIn.checked ? 'true' : 'false');
  formData.append('phone',            document.getElementById('phone').value.trim());
  formData.append('address',          document.getElementById('address').value.trim());
  formData.append('suburb',           document.getElementById('suburb').value.trim());
  formData.append('state',            document.getElementById('state').value);
  formData.append('electricity_bill', document.getElementById('electricity_bill').value);
  formData.append('source',           'website');
  formData.append('utm_source',       getParam('utm_source'));
  formData.append('utm_medium',       getParam('utm_medium'));
  formData.append('utm_campaign',     getParam('utm_campaign'));

  // Attach bill files if provided
  const files = billAttachments.files;
  for (let i = 0; i < Math.min(files.length, 3); i++) {
    formData.append('bill_attachments', files[i]);
  }

  // Show loading state
  setLoading(true);

  try {
    const response = await fetch(`${BACKEND_URL}/leads`, {
      method: 'POST',
      body: formData,
      // No Content-Type header — browser sets it automatically with boundary for multipart
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Success — hide form, show thank you message
    formCard.style.display = 'none';
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Fire Meta Pixel lead event if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }

  } catch (err) {
    console.error('Form submission error:', err);
    showError('Something went wrong. Please try again or email us at hello@mysolarreport.com.au');
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.style.display = isLoading ? 'none' : 'inline';
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
