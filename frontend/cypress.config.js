{
  "e2e": {
    "baseUrl": "http://localhost:3000",
    "specPattern": "cypress/e2e/**/*.cy.js",
    "supportFile": "cypress/support/e2e.js",
    "fixturesFolder": "cypress/fixtures",
    "screenshotsFolder": "cypress/screenshots",
    "videosFolder": "cypress/videos",
    "downloadsFolder": "cypress/downloads",
    "viewportWidth": 1280,
    "viewportHeight": 720,
    "video": false,
    "screenshotOnRunFailure": true,
    "defaultCommandTimeout": 10000,
    "requestTimeout": 10000,
    "responseTimeout": 30000,
    "experimentalStudio": true,
    "setupNodeEvents": (on, config) => {
      // Task for database seeding
      on('task', {
        seedDatabase() {
          console.log('Seeding test database...');
          return null;
        },
        clearDatabase() {
          console.log('Clearing test database...');
          return null;
        },
        setViewport(width, height) {
          cy.viewport(width, height);
          return null;
        }
      });
      
      // Plugin for performance testing
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
      
      return config;
    }
  },
  "component": {
    "devServer": {
      framework": "create-react-app",
      bundler": "webpack",
      port": 3000
    },
    "specPattern": "src/**/*.cy.{js,jsx,ts,tsx}",
    "supportFile": "cypress/support/component.js",
    "indexHtmlFile": "cypress/support/component-index.html"
  }
}
