// ============================================
// AUTHENTICATION LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Basic validation
            if (!email || !password) {
                showAlert('Please fill in all fields', 'danger');
                return;
            }

            // Email validation
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address', 'danger');
                return;
            }

            showLoading();

            // Simulate API call
            setTimeout(() => {
                hideLoading();
                
                // Mock successful login
                const user = {
                    email: email,
                    name: 'John Doe',
                    phone: '+1234567890'
                };

                Storage.set('user', user);
                Storage.set('isLoggedIn', true);

                showAlert('Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1500);
            }, 1500);
        });
    }

    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullname= document.getElementById('fullname').value;
const email = document.getElementById('email').value;
const phone = document.getElementById('phone').value;
const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;
const terms = document.getElementById('terms').checked;        // Validation
        if (!fullname || !email || !phone || !password || !confirmPassword) {
            showAlert('Please fill in all fields', 'danger');
            return;
        }

        if (!validateEmail(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        if (!validatePhone(phone)) {
            showAlert('Please enter a valid phone number', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        if (!terms) {
            showAlert('Please accept the terms and conditions', 'danger');
            return;
        }

        showLoading();

        // Simulate API call
        setTimeout(() => {
            hideLoading();
            
            // Mock successful registration
            const user = {
                name: fullname,
                email: email,
                phone: phone
            };

            Storage.set('user', user);
            Storage.set('isLoggedIn', true);

            showAlert('Registration successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);
        }, 1500);
    });
}});

// Email validation function
function validateEmail(email) {
const re = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
return re.test(email);
}

// Phone validation function
function validatePhone(phone) {
const re = /^[\d\s-+()]+$/;
return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Logout function
function logout() {
Storage.remove('user');
Storage.remove('isLoggedIn');
Storage.remove('cart');
showAlert('Logged out successfully', 'success');
setTimeout(() => {
window.location.href = 'pages/customer/login.html';
}, 1000);
}

// Check if user is logged in
function isAuthenticated() {
return Storage.get('isLoggedIn') === true;
}

// Get current user
function getCurrentUser() {
return Storage.get('user');
}