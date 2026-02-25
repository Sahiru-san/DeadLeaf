// max-contact.js
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('max-contact-form');
  const successMessage = document.getElementById('max-form-success');
  const submitBtn = document.getElementById('max-submit-btn');
  
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
      
      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      try {
        // Simulate sending (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage as backup
        const messages = JSON.parse(localStorage.getItem('max_studio_messages') || '[]');
        messages.push(formData);
        localStorage.setItem('max_studio_messages', JSON.stringify(messages));
        
        // Hide form, show success
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Optional: open mailto as fallback
        // const mailtoLink = `mailto:max.works.help@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=Name: ${encodeURIComponent(formData.name)}%0AEmail: ${encodeURIComponent(formData.email)}%0A%0A${encodeURIComponent(formData.message)}`;
        // window.open(mailtoLink, '_blank');
        
      } catch (error) {
        alert('Something went wrong. Please email directly: max.works.help@gmail.com');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});