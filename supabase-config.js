/* ===== POCKET TOON — Supabase Configuration ===== */
(function () {
  var SUPABASE_URL     = 'https://xdkiqkmivkkgwuhsvqnl.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhka2lxa21pdmtrZ3d1aHN2cW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjI4NDIsImV4cCI6MjA5NDMzODg0Mn0.ea4V6yEJ2USuVTneefcPqdupmeBRerO6Zy0z5S9BJC0';
  window.POCKET_TOON_SUPABASE_URL     = SUPABASE_URL;
  window.POCKET_TOON_SUPABASE_KEY     = SUPABASE_ANON_KEY;
  window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
