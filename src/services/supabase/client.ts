// services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgxcbdsurcaxisfbhjex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRneGNiZHN1cmNheGlzZmJoamV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDg3ODUsImV4cCI6MjA3OTMyNDc4NX0.diJ6oPukqD-mDxohk-bFTABaMMdreYMq6Tj8fwcrejw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);