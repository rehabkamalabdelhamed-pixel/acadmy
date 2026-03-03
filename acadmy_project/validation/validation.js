// validation.js - Frontend Validation

// دالة لعرض رسائل الخطأ
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.animation = 'slideIn 0.3s ease';
}

// دالة لإخفاء رسائل الخطأ
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

// دالة لعرض رسائل النجاح
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
    successElement.style.animation = 'slideIn 0.3s ease';
}

// التحقق من البريد الإلكتروني
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// التحقق من كلمة المرور (8 أحرف على الأقل، تحتوي على حرف كبير وصغير ورقم)
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// التحقق من رقم الهاتف المصري
function validateEgyptianPhone(phone) {
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    return phoneRegex.test(phone);
}

// التحقق من الاسم (يحتوي على حروف عربية أو إنجليزية فقط)
function validateName(name) {
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{3,}$/;
    return nameRegex.test(name);
}

// فاليديشن تسجيل الدخول
function validateLoginForm() {
    let isValid = true;
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // التحقق من البريد الإلكتروني
    if (!email) {
        showError('emailError', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'البريد الإلكتروني غير صالح');
        isValid = false;
    } else {
        hideError('emailError');
    }
    
    // التحقق من كلمة المرور
    if (!password) {
        showError('passwordError', 'كلمة المرور مطلوبة');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        isValid = false;
    } else {
        hideError('passwordError');
    }
    
    return isValid;
}

// فاليديشن التسجيل
function validateRegisterForm() {
    let isValid = true;
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // التحقق من الاسم
    if (!fullName) {
        showError('nameError', 'الاسم الكامل مطلوب');
        isValid = false;
    } else if (!validateName(fullName)) {
        showError('nameError', 'الاسم يجب أن يحتوي على حروف فقط (3 أحرف على الأقل)');
        isValid = false;
    } else {
        hideError('nameError');
    }
    
    // التحقق من البريد الإلكتروني
    if (!email) {
        showError('emailError', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'البريد الإلكتروني غير صالح');
        isValid = false;
    } else {
        hideError('emailError');
    }
    
    // التحقق من رقم الهاتف
    if (!phone) {
        showError('phoneError', 'رقم الهاتف مطلوب');
        isValid = false;
    } else if (!validateEgyptianPhone(phone)) {
        showError('phoneError', 'رقم هاتف مصري غير صالح (يبدأ ب 01)');
        isValid = false;
    } else {
        hideError('phoneError');
    }
    
    // التحقق من كلمة المرور
    if (!password) {
        showError('passwordError', 'كلمة المرور مطلوبة');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('passwordError', 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم');
        isValid = false;
    } else {
        hideError('passwordError');
    }
    
    // التحقق من تأكيد كلمة المرور
    if (!confirmPassword) {
        showError('confirmPasswordError', 'تأكيد كلمة المرور مطلوب');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'كلمات المرور غير متطابقة');
        isValid = false;
    } else {
        hideError('confirmPasswordError');
    }
    
    // التحقق من الشروط
    if (!terms) {
        showError('termsError', 'يجب الموافقة على الشروط والأحكام');
        isValid = false;
    } else {
        hideError('termsError');
    }
    
    return isValid;
}

// إظهار/إخفاء كلمة المرور
function togglePasswordVisibility(inputId, toggleBtnId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);
    
    if (passwordInput && toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // تغيير الأيقونة
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
}

// تهيئة الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إعداد عرض/إخفاء كلمة المرور
    togglePasswordVisibility('password', 'togglePassword');
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
    
    // إضافة فاليديشن أثناء الكتابة
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (this.value.trim()) {
                hideError('emailError');
            }
        });
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (this.value) {
                hideError('passwordError');
            }
        });
    }
});