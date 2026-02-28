// js/avatar.js - COMPLETELY REWRITTEN & WORKING
class AvatarManager {
  constructor() {
    this.user = null;
    this.modal = null;
    this.init();
  }
  
  async init() {
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      this.user = user;
      
      if (!this.user) {
        console.log('No user logged in');
        return;
      }
      
      this.setupEventListeners();
      this.loadAvatar();
    } catch (error) {
      console.error('Avatar init failed:', error);
    }
  }
  
  setupEventListeners() {
    // Edit button click
    const editBtn = document.getElementById('edit-avatar');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openModal());
    }
    
    // Modal close buttons
    const cancelBtn = document.getElementById('cancel-avatar-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }
    
    // File input change
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    
    // Zoom controls
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const cropImage = document.getElementById('crop-image');
    
    if (zoomSlider && cropImage) {
      zoomSlider.addEventListener('input', () => {
        cropImage.style.transform = `scale(${zoomSlider.value})`;
      });
    }
    
    if (zoomIn && zoomSlider && cropImage) {
      zoomIn.addEventListener('click', () => {
        zoomSlider.value = Math.min(2, parseFloat(zoomSlider.value) + 0.1);
        cropImage.style.transform = `scale(${zoomSlider.value})`;
      });
    }
    
    if (zoomOut && zoomSlider && cropImage) {
      zoomOut.addEventListener('click', () => {
        zoomSlider.value = Math.max(0.5, parseFloat(zoomSlider.value) - 0.1);
        cropImage.style.transform = `scale(${zoomSlider.value})`;
      });
    }
    
    // Remove avatar
    const removeBtn = document.getElementById('remove-avatar');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeAvatar());
    }
    
    // Save avatar
    const saveBtn = document.getElementById('save-avatar');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.uploadAvatar());
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }
  
  openModal() {
    const modal = document.getElementById('avatar-upload-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  closeModal() {
    const modal = document.getElementById('avatar-upload-modal');
    if (modal) {
      modal.style.display = 'none';
      this.resetUpload();
    }
  }
  
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    
    // Show image editor
    const imageEditor = document.getElementById('image-editor');
    const saveBtn = document.getElementById('save-avatar');
    const zoomSlider = document.getElementById('zoom-slider');
    const cropImage = document.getElementById('crop-image');
    
    if (imageEditor && saveBtn && zoomSlider && cropImage) {
      imageEditor.style.display = 'block';
      saveBtn.style.display = 'inline-flex';
      zoomSlider.value = 1;
      cropImage.style.transform = 'scale(1)';
      
      // Preview image
      this.previewImage(file);
    }
  }
  
  previewImage(file) {
    const reader = new FileReader();
    const cropImage = document.getElementById('crop-image');
    
    reader.onload = (e) => {
      cropImage.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  async uploadAvatar() {
    const fileInput = document.getElementById('avatar-upload');
    const file = fileInput.files[0];
    
    if (!file || !this.user) {
      alert('No file selected');
      return;
    }
    
    // Show progress
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const saveBtn = document.getElementById('save-avatar');
    
    progressContainer.style.display = 'block';
    saveBtn.disabled = true;
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${this.user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to:', fileName);
      
      // Upload to Supabase Storage
      const { data, error } = await window.supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message);
      }
      
      console.log('Upload success:', data);
      
      // Get public URL
      const { data: { publicUrl } } = window.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('Public URL:', publicUrl);
      
      // Update user metadata
      const { error: updateError } = await window.supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      // Update avatar display
      this.updateAvatarDisplay(publicUrl);
      
      // Show success
      this.showToast('Avatar updated successfully!');
      this.closeModal();
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar: ' + error.message);
      this.resetUpload();
    }
  }
  
  async removeAvatar() {
    if (!confirm('Remove your profile picture?')) return;
    
    try {
      // Update user metadata
      const { error } = await window.supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      
      if (error) throw error;
      
      // Reset to default icon
      const avatar = document.querySelector('.avatar');
      avatar.innerHTML = '<i class="fas fa-user-circle"></i>';
      
      this.showToast('Avatar removed');
      this.closeModal();
      
    } catch (error) {
      console.error('Remove failed:', error);
      alert('Failed to remove avatar: ' + error.message);
    }
  }
  
  async loadAvatar() {
    if (!this.user?.user_metadata?.avatar_url) return;
    
    const avatarUrl = this.user.user_metadata.avatar_url;
    this.updateAvatarDisplay(avatarUrl);
  }
  
  updateAvatarDisplay(url) {
  const avatar = document.querySelector('.avatar');
  if (avatar) {
    avatar.innerHTML = `<img src="${url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
  }
}
  
  resetUpload() {
    const fileInput = document.getElementById('avatar-upload');
    const imageEditor = document.getElementById('image-editor');
    const saveBtn = document.getElementById('save-avatar');
    const progressContainer = document.getElementById('upload-progress');
    const cropImage = document.getElementById('crop-image');
    
    if (fileInput) fileInput.value = '';
    if (imageEditor) imageEditor.style.display = 'none';
    if (saveBtn) {
      saveBtn.style.display = 'none';
      saveBtn.disabled = false;
    }
    if (progressContainer) progressContainer.style.display = 'none';
    if (cropImage) cropImage.src = '';
  }
  
  showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.avatar-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'avatar-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: #000;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: 500;
      z-index: 10001;
      animation: slideUp 0.3s ease, fadeOut 2s ease 1.7s forwards;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure Supabase is ready
  setTimeout(() => {
    window.avatarManager = new AvatarManager();
  }, 500);
});