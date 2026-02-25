// js/supabase.js
// THIS FILE IS CRITICAL - It initializes Supabase properly

// Wait for Supabase library to load
document.addEventListener('DOMContentLoaded', function() {
  
  // Your Supabase credentials - REPLACE THESE WITH YOUR ACTUAL VALUES
  const supabaseUrl = 'https://mrascfvuuismoblywjlw.supabase.co'; // <-- CHANGE THIS
  const supabaseKey = 'sb_publishable_Uvcczegy6_A4cyZMdJn1sg_4nwQzWfO'; // <-- CHANGE THIS
  
  // Initialize Supabase client
  window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
  
  console.log('✅ Supabase initialized successfully');
  console.log('Methods available:', Object.keys(window.supabase.auth));
});