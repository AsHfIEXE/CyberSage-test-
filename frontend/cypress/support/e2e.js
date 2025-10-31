// Cypress E2E Test Configuration
import './commands';

// Global test configuration
beforeEach(() => {
  // Set up common test fixtures
  cy.intercept('GET', '**/api/**', { fixture: 'api-response.json' }).as('apiRequest');
  cy.intercept('WebSocket', '**', { fixture: 'websocket-response.json' }).as('websocket');
  
  // Set viewport for consistent testing
  cy.viewport(1280, 720);
  
  // Enable accessibility testing
  cy.injectAxe();
  
  // Set up performance monitoring
  cy.window().then((win) => {
    win.performance.mark('test-start');
  });
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on certain expected errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Test environment setup
before(() => {
  // Set up test environment
  cy.request('POST', '/api/test/setup', { environment: 'e2e' });
});

after(() => {
  // Clean up test environment
  cy.request('DELETE', '/api/test/cleanup');
});

// Performance monitoring
afterEach(() => {
  cy.window().then((win) => {
    win.performance.mark('test-end');
    win.performance.measure('test-duration', 'test-start', 'test-end');
    const measures = win.performance.getEntriesByType('measure');
    
    if (measures.length > 0) {
      cy.log(`Test Duration: ${measures[0].duration}ms`);
    }
  });
});

// Accessibility check function
export const checkA11y = (selector, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(selector, {
    includedImpacts: ['critical', 'serious'],
    ...options
  });
};

// Performance check function
export const checkPerformance = (threshold = 1000) => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      expect(navigation.loadEventEnd - navigation.navigationStart).to.be.lessThan(threshold);
    }
  });
};

// Mock WebSocket connection
export const mockWebSocketConnection = (status = 'connected') => {
  cy.intercept('GET', '**/websocket*', { fixture: `websocket-${status}.json` });
};

// Mock API responses
export const mockApiResponse = (endpoint, data) => {
  cy.intercept('GET', `**/${endpoint}`, { fixture: data }).as(endpoint);
};

// Test user interactions
export const testUserFlow = (flow) => {
  flow.steps.forEach(step => {
    if (step.type === 'click') {
      cy.get(step.selector).click();
    } else if (step.type === 'type') {
      cy.get(step.selector).type(step.value);
    } else if (step.type === 'wait') {
      cy.wait(step.duration || 1000);
    }
  });
};

// Responsive testing helper
export const testResponsive = (component, viewports = [
  { width: 320, height: 568 }, // Mobile
  { width: 768, height: 1024 }, // Tablet
  { width: 1280, height: 720 } // Desktop
]) => {
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get(component).should('be.visible');
  });
};
