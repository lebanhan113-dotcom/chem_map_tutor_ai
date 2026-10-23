/* EduPlan AI 5.6 - Public deployment configuration.
   These two Supabase values are PUBLIC CLIENT values, never a service_role key.
   Copy the Project URL and anon/publishable key from Supabase Dashboard > Project Settings > API.
   For a multi-device website, configure these values BEFORE uploading to hosting.
*/
window.EDUPLAN_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  aiEndpoint: '/api/ai'
};
