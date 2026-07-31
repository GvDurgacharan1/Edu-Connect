export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false', // Default to headless
  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_TIMEOUT || '5000'),
    explicit: parseInt(process.env.EXPLICIT_TIMEOUT || '10000')
  },
  environment: process.env.NODE_ENV || 'development'
};

export default config;
