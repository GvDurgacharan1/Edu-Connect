export const config = {
  host: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT || '4723'),
  path: '/wd/hub',
  capabilities: {
    platformName: 'Android',
    'appium:deviceName': 'Android Emulator',
    'appium:app': './apps/educonnect-mobile.apk',
    'appium:automationName': 'UiAutomator2',
    'appium:ensureWebviewsHavePages': true
  },
  environment: process.env.NODE_ENV || 'development'
};

export default config;
