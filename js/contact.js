// contact.js
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('max-contact-form');
  const formSection = document.getElementById('max-form-section');
  const successMessage = document.getElementById('max-success');
  const submitBtn = document.getElementById('submit-btn');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
      };
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage as backup
        const messages = JSON.parse(localStorage.getItem('max_studio_contacts') || '[]');
        messages.push(formData);
        localStorage.setItem('max_studio_contacts', JSON.stringify(messages));
        
        // Hide form, show success
        formSection.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Optional: Open mailto as fallback
        const mailtoLink = `mailto:max.works.help@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=Name: ${encodeURIComponent(formData.name)}%0AEmail: ${encodeURIComponent(formData.email)}%0A%0A${encodeURIComponent(formData.message)}`;
        
        // Uncomment to open mailto as backup
        // window.open(mailtoLink, '_blank');
        
      } catch (error) {
        alert('Something went wrong. Please email directly: max.works.help@gmail.com');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Handle back button safely
  const backBtn = document.querySelector('.max-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});