document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  
  // Prevent scrolling when menu is open
  function preventScroll(e) {
    e.preventDefault();
  }

  function openMenu() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    // Add touchmove prevention for mobile
    document.addEventListener('touchmove', preventScroll, { passive: false });
  }

  function closeMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    // Restore body scrolling
    document.body.style.overflow = '';
    // Remove touchmove prevention
    document.removeEventListener('touchmove', preventScroll);
  }

  // Event listeners
  if (menuBtn) {
    menuBtn.addEventListener("click", openMenu);
  }
  
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Close menu when clicking on sidebar links (optional)
  const sidebarLinks = document.querySelectorAll("#sidebar a");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeMenu();
    }
  });
});