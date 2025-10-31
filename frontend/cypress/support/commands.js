// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global error handling for uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // You can customize this based on your application's error handling
  console.log('Uncaught exception:', err.message);
  
  // Don't fail tests on certain expected errors
  if (err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('Script error') ||
      err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  
  // Fail on other errors
  return true;
});

// Performance monitoring
Cypress.Commands.add('measurePerformance', () => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      cy.log(`Page Load Time: ${navigation.loadEventEnd - navigation.navigationStart}ms`);
      cy.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.navigationStart}ms`);
    }
  });
});

// Mock WebSocket connection
Cypress.Commands.add('mockWebSocket', (status = 'connected') => {
  cy.intercept('GET', '**/socket.io/**', {
    statusCode: 200,
    body: { status, message: 'WebSocket mock response' }
  });
});

// Accessibility testing helper
Cypress.Commands.add('checkA11y', (selector, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(selector, {
    includedImpacts: ['critical', 'serious'],
    ...options
  });
});

// Custom command for waiting for React to be ready
Cypress.Commands.add('waitForReact', (timeout = 10000) => {
  cy.window().should('have.property', 'React');
  cy.window().its('React.version').should('exist');
});

// Mock API responses
Cypress.Commands.add('mockApiResponse', (method, url, response) => {
  cy.intercept(method.toUpperCase(), url, response);
});

// Test responsive design
Cypress.Commands.add('testResponsive', (componentSelector, viewports = [
  { width: 320, height: 568, name: 'Mobile' },
  { width: 768, height: 1024, name: 'Tablet' },
  { width: 1280, height: 720, name: 'Desktop' }
]) => {
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    cy.get(componentSelector).should('be.visible');
  });
});

// Set up test data
Cypress.Commands.add('setupTestData', () => {
  cy.intercept('GET', '**/api/vulnerabilities', {
    statusCode: 200,
    body: {
      vulnerabilities: [
        {
          id: 1,
          title: 'SQL Injection Vulnerability',
          severity: 'critical',
          description: 'Potential SQL injection in user input field',
          cve_id: 'CVE-2024-1234',
          cvss_score: 9.8,
          timestamp: '2025-10-31T10:00:00Z'
        },
        {
          id: 2,
          title: 'Cross-Site Scripting (XSS)',
          severity: 'high',
          description: 'XSS vulnerability in comment system',
          cve_id: 'CVE-2024-5678',
          cvss_score: 7.5,
          timestamp: '2025-10-31T11:00:00Z'
        }
      ],
      stats: {
        critical: 1,
        high: 1,
        medium: 0,
        low: 0
      }
    }
  }).as('getVulnerabilities');
});

// Custom command for checking loading states
Cypress.Commands.add('checkLoadingState', (selector) => {
  cy.get(selector).should('exist');
  cy.get(selector).find('[data-testid="loading"], .loading, .spinner').should('exist');
  cy.get(selector).find('[data-testid="content"]').should('not.be.visible');
});
