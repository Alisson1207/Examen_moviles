import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.chatapp',
  appName: 'loginchatAppWHS',
  webDir: 'www',
  server: {
    cleartext: true, // Necesario si usas Supabase o APIs HTTP sin HTTPS
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;

