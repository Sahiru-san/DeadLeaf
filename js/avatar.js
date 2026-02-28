// js/avatar.js
class AvatarManager {
  constructor() {
    this.user = null;
    this.init();
  }
  
  async init() {
    const { data: { user } } = await window.supabase.auth.getUser();
    this.user = user;
    this.setupAvatarUpload();
    this.loadAvatar();
  }
  
  setupAvatarUpload() {
    const editAvatarBtn = document.getElementById('edit-avatar');
    const uploadModal = document.getElementById('avatar-upload-modal');
    const cancelBtn = document.getElementById('cancel-avatar-edit');
    const fileInput = document.getElementById('avatar-upload');
    const removeBtn = document.getElementById('remove-avatar');
    const saveBtn = document.getElementById('save-avatar');
    const imageEditor = document.getElementById('image-editor');
    const cropImage = document.getElementById('crop-image');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    
    if (!editAvatarBtn || !uploadModal) return;
    
    // Open modal
    editAvatarBtn.addEventListener('click', () => {
      uploadModal.style.display = 'flex';
      this.resetUpload();
    });
    
    // Close modal
    cancelBtn.addEventListener('click', () => {
      uploadModal.style.display = 'none';
      this.resetUpload();
    });
    
    // Click outside to close
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) {
        uploadModal.style.display = 'none';
        this.resetUpload();
      }
    });
    
    // File selection
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.previewImage(file);
        imageEditor.style.display = 'block';
        saveBtn.style.display = 'inline-flex';
      }
    });
    
    // Zoom controls
    zoomSlider.addEventListener('input', () => {
      cropImage.style.transform = `scale(${zoomSlider.value})`;
    });
    
    zoomIn.addEventListener('click', () => {
      zoomSlider.value = Math.min(2, parseFloat(zoomSlider.value) + 0.1);
      cropImage.style.transform = `scale(${zoomSlider.value})`;
    });
    
    zoomOut.addEventListener('click', () => {
      zoomSlider.value = Math.max(0.5, parseFloat(zoomSlider.value) - 0.1);
      cropImage.style.transform = `scale(${zoomSlider.value})`;
    });
    
    // Remove avatar
    removeBtn.addEventListener('click', () => {
      this.removeAvatar();
    });
    
    // Save avatar
    saveBtn.addEventListener('click', () => {
      this.uploadAvatar();
    });
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
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const saveBtn = document.getElementById('save-avatar');
    
    if (!file || !this.user) return;
    
    // Show progress
    progressContainer.style.display = 'block';
    saveBtn.disabled = true;
    
    // Create file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${this.user.id}/avatar.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await window.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          progressFill.style.width = `${percent}%`;
          progressText.textContent = `Uploading ${Math.round(percent)}%`;
        }
      });
    
    if (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar');
      this.resetUpload();
      return;
    }
    
    // Get public URL
    const { data: { publicUrl } } = window.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update user metadata
    const { error: updateError } = await window.supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    if (updateError) {
      console.error('Failed to update user:', updateError);
      alert('Avatar uploaded but failed to update profile');
    }
    
    // Update avatar display
    this.updateAvatarDisplay(publicUrl);
    
    // Close modal
    document.getElementById('avatar-upload-modal').style.display = 'none';
    this.resetUpload();
    
    // Show success
    this.showToast('Avatar updated successfully!');
  }
  
  async removeAvatar() {
    if (!confirm('Remove your profile picture?')) return;
    
    // Update user metadata
    const { error } = await window.supabase.auth.updateUser({
      data: { avatar_url: null }
    });
    
    if (error) {
      alert('Failed to remove avatar');
      return;
    }
    
    // Reset to default icon
    const avatar = document.querySelector('.avatar');
    avatar.innerHTML = '<i class="fas fa-user-circle"></i>';
    
    // Close modal
    document.getElementById('avatar-upload-modal').style.display = 'none';
    this.resetUpload();
    
    this.showToast('Avatar removed');
  }
  
  async loadAvatar() {
    if (!this.user?.user_metadata?.avatar_url) return;
    
    const avatarUrl = this.user.user_metadata.avatar_url;
    this.updateAvatarDisplay(avatarUrl);
  }
  
  updateAvatarDisplay(url) {
    const avatar = document.querySelector('.avatar');
    avatar.innerHTML = `<img src="${url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
  }
  
  resetUpload() {
    document.getElementById('avatar-upload').value = '';
    document.getElementById('image-editor').style.display = 'none';
    document.getElementById('save-avatar').style.display = 'none';
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('save-avatar').disabled = false;
  }
  
  showToast(message) {
    const toast = document.createElement('div');
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
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.avatarManager = new AvatarManager();
});