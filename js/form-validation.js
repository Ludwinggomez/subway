class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.options = Object.assign({
            errorClass: 'error',
            successClass: 'success',
            fieldSelector: '.form-group',
            errorElement: 'span',
            errorElementClass: 'error-message',
            onSuccess: null,
            onError: null
        }, options);
        
        this.init();
    }
    
    init() {
        this.form.setAttribute('novalidate', true);
        this.form.addEventListener('submit', this.validate.bind(this));
        
        // Add live validation on blur
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this, input));
        });
    }
    
    validate(e) {
        e.preventDefault();
        
        let isValid = true;
        const fields = this.form.querySelectorAll(this.options.fieldSelector);
        
        fields.forEach(field => {
            const input = field.querySelector('input, select, textarea');
            if (input) {
                const fieldValid = this.validateField(input);
                if (!fieldValid) {
                    isValid = false;
                }
            }
        });
        
        if (isValid) {
            this.form.classList.add(this.options.successClass);
            this.form.classList.remove(this.options.errorClass);
            
            if (typeof this.options.onSuccess === 'function') {
                this.options.onSuccess(this.form);
            }
            
            // In a real app, you would submit the form here
            // this.form.submit();
        } else {
            this.form.classList.add(this.options.errorClass);
            this.form.classList.remove(this.options.successClass);
            
            if (typeof this.options.onError === 'function') {
                this.options.onError(this.form);
            }
        }
        
        return isValid;
    }
    
    validateField(input) {
        const field = input.closest(this.options.fieldSelector);
        let errorElement = field.querySelector(`.${this.options.errorElementClass}`);
        
        // Create error element if it doesn't exist
        if (!errorElement) {
            errorElement = document.createElement(this.options.errorElement);
            errorElement.className = this.options.errorElementClass;
            field.appendChild(errorElement);
        }
        
        // Clear previous error
        errorElement.textContent = '';
        field.classList.remove(this.options.errorClass);
        
        // Validate based on input type and attributes
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim() && !this.validateEmail(input.value)) {
            isValid = false;
            errorMessage = 'Por favor ingresa un email válido';
        }
        
        // Number validation
        if (input.type === 'number') {
            const min = input.getAttribute('min');
            const max = input.getAttribute('max');
            
            if (min && parseFloat(input.value) < parseFloat(min)) {
                isValid = false;
                errorMessage = `El valor mínimo es ${min}`;
            }
            
            if (max && parseFloat(input.value) > parseFloat(max)) {
                isValid = false;
                errorMessage = `El valor máximo es ${max}`;
            }
        }
        
        // Custom pattern validation
        if (input.hasAttribute('pattern')) {
            const pattern = new RegExp(input.getAttribute('pattern'));
            if (input.value.trim() && !pattern.test(input.value)) {
                isValid = false;
                errorMessage = input.getAttribute('data-pattern-error') || 'El formato no es válido';
            }
        }
        
        // Password confirmation
        if (input.hasAttribute('data-confirm')) {
            const confirmWith = document.getElementById(input.getAttribute('data-confirm'));
            if (confirmWith && input.value !== confirmWith.value) {
                isValid = false;
                errorMessage = 'Las contraseñas no coinciden';
            }
        }
        
        // Display error if invalid
        if (!isValid) {
            errorElement.textContent = errorMessage;
            field.classList.add(this.options.errorClass);
        }
        
        return isValid;
    }
    
    validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
}

// Initialize form validation on all forms
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('form').forEach(form => {
        new FormValidator(form, {
            onSuccess: function(form) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success-message';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <p>¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.</p>
                `;
                
                form.parentNode.insertBefore(successMessage, form.nextSibling);
                form.style.display = 'none';
                
                // In a real app, you would submit the form via AJAX here
                // submitForm(form);
            },
            onError: function(form) {
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
    });
});