// auth.js - معدل للعمل مع Bootstrap

// دالة لعرض رسائل الخطأ مع Bootstrap
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    const input = document.querySelector(`[aria-describedby="${elementId}"]`) ||
        document.getElementById(elementId.replace('Error', ''));

    if (element && input) {
        element.textContent = message;
        element.style.display = 'block';
        input.classList.add('is-invalid');
    }
}

// دالة لإخفاء رسائل الخطأ
function hideError(elementId) {
    const element = document.getElementById(elementId);
    const input = document.querySelector(`[aria-describedby="${elementId}"]`) ||
        document.getElementById(elementId.replace('Error', ''));

    if (element && input) {
        element.style.display = 'none';
        input.classList.remove('is-invalid');
    }
}

// دالة لعرض رسائل النجاح
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');

    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('d-none');
        successElement.classList.add('show');

        // إخفاء رسالة الخطأ إذا كانت ظاهرة
        if (errorElement) {
            errorElement.classList.add('d-none');
            errorElement.classList.remove('show');
        }
    }
}

// دالة لعرض رسائل الخطأ العامة
function showGeneralError(message) {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
        errorElement.classList.add('show');

        // إخفاء رسالة النجاح إذا كانت ظاهرة
        if (successElement) {
            successElement.classList.add('d-none');
            successElement.classList.remove('show');
        }
    }
}

// إظهار حالة التحميل
function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');

    if (button && spinner && btnText) {
        button.disabled = true;
        spinner.classList.remove('d-none');
        btnText.textContent = 'جاري المعالجة...';
    }
}

// إخفاء حالة التحميل
function hideLoading(buttonId, originalText) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');

    if (button && spinner && btnText) {
        button.disabled = false;
        spinner.classList.add('d-none');
        btnText.textContent = originalText;
    }
}

// معالجة تسجيل الدخول مع Bootstrap
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // تنظيف رسائل الخطأ السابقة
            document.querySelectorAll('.is-invalid').forEach(el => {
                el.classList.remove('is-invalid');
            });

            // التحقق من المدخلات
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            let isValid = true;

            if (!email) {
                showError('emailError', 'البريد الإلكتروني مطلوب');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('emailError', 'البريد الإلكتروني غير صالح');
                isValid = false;
            }

            if (!password) {
                showError('passwordError', 'كلمة المرور مطلوبة');
                isValid = false;
            } else if (password.length < 6) {
                showError('passwordError', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                isValid = false;
            }

            if (!isValid) return;

            // عرض حالة التحميل
            showLoading('loginBtn');

            try {
                // Commented out for frontend-only version
                /*
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                */

                // send credentials to backend
                const response = await fetch('https://acadmy-production.up.railway.app/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    // success response contains role, message
                    Swal.fire('تم!', 'تم تسجيل الدخول بنجاح', 'success').then(() => {
                        // store user data in localStorage
                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userRole', data.role);
                        
                        // redirect based on role
                        if (data.role === 'admin') {
                            window.location.href = '../admin/dashboard.html';
                        } else if (data.role === 'teacher') {
                            window.location.href = '../teacher/home.html';
                        } else {
                            window.location.href = '../student/dashboard.html';
                        }
                    });
                } else {
                    Swal.fire('خطأ', data.message || 'خطأ في تسجيل الدخول', 'error');
                    hideLoading('loginBtn', 'تسجيل الدخول');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('خطأ', 'حدث خطأ في الاتصال بالخادم', 'error');
                hideLoading('loginBtn', 'تسجيل الدخول');
            }
        });
    }

    // التسجيل
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // تنظيف رسائل الخطأ السابقة
            document.querySelectorAll('.is-invalid').forEach(el => {
                el.classList.remove('is-invalid');
            });

            // التحقق من المدخلات
            const isValid = validateRegisterForm();
            if (!isValid) return;

            // عرض حالة التحميل
            showLoading('registerBtn');

            try {
                // post registration data to backend
                const response = await fetch('https://acadmy-production.up.railway.app/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: document.getElementById('email').value.trim(),
                        password: document.getElementById('password').value
                    })
                });
                const data = await response.json();

                if (response.ok) {
                    Swal.fire('تم!', 'تم إنشاء الحساب بنجاح!', 'success').then(() => {
                        window.location.href = '../login/login.html';
                    });
                } else {
                    Swal.fire('خطأ', data.message || 'خطأ في إنشاء الحساب', 'error');
                    hideLoading('registerBtn', 'إنشاء حساب');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('خطأ', 'حدث خطأ في الاتصال بالخادم', 'error');
                hideLoading('registerBtn', 'إنشاء حساب');
            }
        });
    }

    // Real-time validation أثناء الكتابة
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            if (this.value.trim()) {
                hideError('emailError');
            }
        });
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            if (this.value) {
                hideError('passwordError');
            }
        });
    }
});