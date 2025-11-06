// Prompt Variable Form Handler for Chrome Extension

/**
 * Parse variables from prompt text
 * @param {string} promptText 
 * @returns {Array} Array of variable objects
 */
function parseVariables(promptText) {
  const variableRegex = /\{\{(\??)([^:}]+):([^:}]+)(?::([^:}]+?))?(?::([^}]+?))?\}\}/g;
  const variables = [];
  let match;

  while ((match = variableRegex.exec(promptText)) !== null) {
    const [fullMatch, optionalMarker, name, type, label, defaultOrOptions] = match;
    const isOptional = optionalMarker === '?';
    
    let options = null;
    let defaultValue = null;

    // For select type, parse options
    if (type === 'select' && defaultOrOptions) {
      const parts = defaultOrOptions.split('|');
      if (parts.length === 2) {
        defaultValue = parts[0];
        options = parts[1].split(',').map(o => o.trim());
      } else {
        options = defaultOrOptions.split(',').map(o => o.trim());
      }
    } else {
      defaultValue = defaultOrOptions;
    }

    variables.push({
      name: name.trim(),
      type: type.trim(),
      label: (label || name).trim().replace(/_/g, ' '),
      defaultValue: defaultValue,
      options: options,
      required: !isOptional,
      rawMatch: fullMatch,
    });
  }

  return variables;
}

/**
 * Check if prompt contains variables
 * @param {string} promptText 
 * @returns {boolean}
 */
function hasVariables(promptText) {
  return /\{\{[^}]+\}\}/.test(promptText);
}

/**
 * Validate field value
 * @param {Object} variable 
 * @param {string} value 
 * @returns {string|null} Error message or null if valid
 */
function validateField(variable, value) {
  if (variable.required && !value?.trim()) {
    return 'This field is required';
  }

  if (!value) return null; // Optional empty field

  switch (variable.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;

    case 'url':
      try {
        new URL(value);
        return null;
      } catch {
        return 'Please enter a valid URL (include http:// or https://)';
      }

    case 'number':
      if (isNaN(Number(value))) {
        return 'Please enter a valid number';
      }
      return null;

    case 'text':
      if (value.length > 500) {
        return 'Maximum 500 characters allowed';
      }
      return null;

    case 'textarea':
      if (value.length > 5000) {
        return 'Maximum 5000 characters allowed';
      }
      return null;

    case 'select':
      if (variable.options && !variable.options.includes(value)) {
        return 'Please select a valid option';
      }
      return null;

    default:
      return null;
  }
}

/**
 * Sanitize input value
 * @param {string} value 
 * @returns {string}
 */
function sanitizeInput(value) {
  // Strip HTML tags and encode special characters
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Create form HTML for variables
 * @param {Array} variables 
 * @returns {string} HTML string
 */
function createFormHTML(variables) {
  let html = '<div class="variable-form-container">';
  
  variables.forEach(variable => {
    html += `<div class="form-field" data-variable="${variable.name}">`;
    html += `<label for="field-${variable.name}">
      ${variable.label}
      ${!variable.required ? '<span class="optional-label">(optional)</span>' : ''}
    </label>`;

    const defaultVal = variable.defaultValue || '';

    switch (variable.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        html += `<input 
          type="${variable.type}" 
          id="field-${variable.name}" 
          name="${variable.name}"
          value="${escapeHtml(defaultVal)}"
          placeholder="${escapeHtml(defaultVal)}"
          ${variable.required ? 'required' : ''}
        />`;
        break;

      case 'textarea':
        html += `<textarea 
          id="field-${variable.name}" 
          name="${variable.name}"
          rows="4"
          placeholder="${escapeHtml(defaultVal)}"
          ${variable.required ? 'required' : ''}
        >${escapeHtml(defaultVal)}</textarea>`;
        break;

      case 'select':
        html += `<select 
          id="field-${variable.name}" 
          name="${variable.name}"
          ${variable.required ? 'required' : ''}
        >`;
        html += '<option value="">Select an option</option>';
        if (variable.options) {
          variable.options.forEach(option => {
            const selected = option === defaultVal ? 'selected' : '';
            html += `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
          });
        }
        html += '</select>';
        break;

      case 'date':
        html += `<input 
          type="date" 
          id="field-${variable.name}" 
          name="${variable.name}"
          value="${escapeHtml(defaultVal)}"
          ${variable.required ? 'required' : ''}
        />`;
        break;
    }

    html += '<div class="field-error" style="display: none;"></div>';
    html += '</div>';
  });

  html += '</div>';
  return html;
}

/**
 * Show variable form modal
 * @param {string} promptText 
 * @param {Function} onSubmit 
 */
function showVariableForm(promptText, onSubmit) {
  const variables = parseVariables(promptText);
  
  if (variables.length === 0) {
    onSubmit(promptText);
    return;
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'variable-form-overlay';
  overlay.innerHTML = `
    <div class="variable-form-modal">
      <div class="variable-form-header">
        <h3>Complete Prompt Details</h3>
        <p>Fill in the required information to customise this prompt</p>
      </div>
      <div class="variable-form-body">
        ${createFormHTML(variables)}
      </div>
      <div class="variable-form-footer">
        <button type="button" class="btn-secondary" id="variableFormCancel">Cancel</button>
        <button type="button" class="btn-primary" id="variableFormSubmit">Use Prompt</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Handle cancel
  document.getElementById('variableFormCancel').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  // Handle submit
  document.getElementById('variableFormSubmit').addEventListener('click', () => {
    // Collect values
    const formValues = {};
    let hasErrors = false;

    variables.forEach(variable => {
      const input = document.getElementById(`field-${variable.name}`);
      const value = input.value;
      const error = validateField(variable, value);

      const fieldDiv = input.closest('.form-field');
      const errorDiv = fieldDiv.querySelector('.field-error');

      if (error) {
        hasErrors = true;
        input.classList.add('error');
        errorDiv.textContent = error;
        errorDiv.style.display = 'block';
      } else {
        input.classList.remove('error');
        errorDiv.style.display = 'none';
        formValues[variable.name] = sanitizeInput(value);
      }
    });

    if (hasErrors) {
      return;
    }

    // Replace variables in prompt
    let completedPrompt = promptText;
    variables.forEach(variable => {
      const value = formValues[variable.name] || '';
      completedPrompt = completedPrompt.replace(variable.rawMatch, value);
    });

    document.body.removeChild(overlay);
    onSubmit(completedPrompt);
  });

  // Clear errors on input
  overlay.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const fieldDiv = input.closest('.form-field');
      const errorDiv = fieldDiv.querySelector('.field-error');
      errorDiv.style.display = 'none';
    });
  });
}

// Utility function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
