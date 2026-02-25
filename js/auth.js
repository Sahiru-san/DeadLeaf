// auth.js - COMPLETE FIXED VERSION

// At the very top of auth.js
console.log('Auth.js loaded');
console.log('Supabase available?', window.supabase ? '✅ YES' : '❌ NO');

if (!window.supabase) {
  console.error('Supabase not initialized! Check script order.');
}
document.addEventListener('DOMContentLoaded', () => {

  // Password toggle visibility - FIXED
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Find the input field - it's the previous sibling
      const input = this.previousElementSibling;

      if (input && (input.type === 'password' || input.type === 'text')) {
        // Toggle type
        const newType = input.type === 'password' ? 'text' : 'password';
        input.type = newType;

        // Toggle icon
        this.innerHTML = newType === 'password'
          ? '<i class="far fa-eye"></i>'
          : '<i class="far fa-eye-slash"></i>';
      }
    });
  });

  // Password strength meter (on signup page)
  const passwordInput = document.getElementById('password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  if (passwordInput && strengthBar && strengthText) {
    passwordInput.addEventListener('input', () => {
      const strength = checkPasswordStrength(passwordInput.value);

      strengthBar.className = 'strength-bar';
      if (strength === 'weak') {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak password';
      } else if (strength === 'medium') {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium password';
      } else if (strength === 'strong') {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong password';
      } else {
        strengthText.textContent = 'Use at least 8 characters';
      }
    });
  }

  // Password match validation (on signup)
  const confirmInput = document.getElementById('confirm-password');
  if (passwordInput && confirmInput) {
    confirmInput.addEventListener('input', () => {
      if (confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity('Passwords do not match');
        confirmInput.style.borderColor = '#ff4d4d';
      } else {
        confirmInput.setCustomValidity('');
        confirmInput.style.borderColor = '';
      }
    });
  }

  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const remember = document.querySelector('input[name="remember"]')?.checked;

      // Show loading state
      const submitBtn = loginForm.querySelector('.auth-submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
      submitBtn.disabled = true;

      try {
        // Call Supabase
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;

        // Success - redirect to library
        window.location.href = 'library.html';
      } catch (error) {
        alert('Login failed: ' + error.message);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Signup form submission - FIXED with preventDefault
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // CRITICAL - stops page reload
      console.log('Signup form submitted');

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const termsChecked = document.querySelector('input[name="terms"]')?.checked;

      // Validate
      if (!termsChecked) {
        alert('You must agree to the Terms of Service');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }

      // Show loading state
      const submitBtn = signupForm.querySelector('.auth-submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
      submitBtn.disabled = true;

      try {
        // Check if Supabase is available
        if (!window.supabase) {
          throw new Error('Supabase not initialized');
        }

        // Call Supabase
        const { data, error } = await window.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: name
            }
          }
        });

        if (error) throw error;

        // Success
        alert('Account created! Please check your email for confirmation.');
        window.location.href = 'login.html';

      } catch (error) {
        console.error('Signup error:', error);
        alert('Error: ' + error.message);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ================= SOCIAL LOGIN =================
  // Google and GitHub sign in

  async function handleSocialLogin(provider) {
    if (!window.supabase) {
      alert('System not ready. Please refresh and try again.');
      return;
    }
    
    try {
      console.log(`🔵 Attempting ${provider} login...`);
      
      // Determine the redirect URL (works for both localhost and production)
      const redirectUrl = window.location.origin + '/library.html';
      
      // Call Supabase OAuth
      const { data, error } = await window.supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      // No need to handle response - user is being redirected
      
    } catch (error) {
      console.error(`🔴 ${provider} login failed:`, error);
      alert(`${provider} login failed: ` + error.message);
    }
  }

  // Attach event listeners to social buttons
  const socialButtons = document.querySelectorAll('.social-btn');
  
  socialButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent any default button behavior
      
      const provider = btn.classList.contains('google') ? 'google' : 'github';
      console.log(`🔵 ${provider} button clicked`);
      
      // Optional: Add loading state
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Redirecting...`;
      btn.disabled = true;
      
      // Call the login function
      handleSocialLogin(provider);
      
      // Note: We don't reset the button because the page will redirect
    });
  });
});