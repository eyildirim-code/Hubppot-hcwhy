/**
 * Basic validation tests for the HubSpot Contact Tagging Service
 * These tests verify that the modules load correctly and have the expected structure
 */

console.log('Starting basic validation tests...\n');

let testsPass = true;

// Test 1: Verify HubSpotService loads correctly
try {
  const HubSpotService = require('./src/services/hubspot.service');
  const service = new HubSpotService('test-token');
  
  if (typeof service.getContactsFromPreviousDay === 'function' &&
      typeof service.extractContactData === 'function' &&
      typeof service.updateContactTags === 'function' &&
      typeof service.batchUpdateContacts === 'function') {
    console.log('✓ HubSpotService: All methods present');
  } else {
    console.log('✗ HubSpotService: Missing expected methods');
    testsPass = false;
  }
} catch (error) {
  console.log('✗ HubSpotService: Failed to load -', error.message);
  testsPass = false;
}

// Test 2: Verify OpenAIService loads correctly
try {
  const OpenAIService = require('./src/services/openai.service');
  const service = new OpenAIService('test-key');
  
  if (typeof service.generateTags === 'function' &&
      typeof service.buildPrompt === 'function' &&
      typeof service.parseTags === 'function' &&
      typeof service.batchGenerateTags === 'function') {
    console.log('✓ OpenAIService: All methods present');
  } else {
    console.log('✗ OpenAIService: Missing expected methods');
    testsPass = false;
  }
} catch (error) {
  console.log('✗ OpenAIService: Failed to load -', error.message);
  testsPass = false;
}

// Test 3: Verify ContactTaggingOrchestrator loads correctly
try {
  const ContactTaggingOrchestrator = require('./src/orchestrator');
  const orchestrator = new ContactTaggingOrchestrator('test-hubspot-token', 'test-openai-key');
  
  if (typeof orchestrator.processContacts === 'function' &&
      typeof orchestrator.getStatus === 'function') {
    console.log('✓ ContactTaggingOrchestrator: All methods present');
  } else {
    console.log('✗ ContactTaggingOrchestrator: Missing expected methods');
    testsPass = false;
  }
} catch (error) {
  console.log('✗ ContactTaggingOrchestrator: Failed to load -', error.message);
  testsPass = false;
}

// Test 4: Verify tag parsing logic
try {
  const OpenAIService = require('./src/services/openai.service');
  const service = new OpenAIService('test-key');
  
  const testInput = 'high-priority, decision-maker, tech-industry';
  const tags = service.parseTags(testInput);
  
  if (tags.length === 3 && tags.includes('high-priority') && tags.includes('decision-maker') && tags.includes('tech-industry')) {
    console.log('✓ OpenAIService.parseTags: Correctly parses comma-separated tags');
  } else {
    console.log('✗ OpenAIService.parseTags: Failed to parse tags correctly');
    testsPass = false;
  }
} catch (error) {
  console.log('✗ OpenAIService.parseTags test failed -', error.message);
  testsPass = false;
}

// Test 5: Verify contact data extraction
try {
  const HubSpotService = require('./src/services/hubspot.service');
  const service = new HubSpotService('test-token');
  
  const mockContact = {
    id: '123',
    properties: {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      company: 'Test Corp',
      jobtitle: 'CEO'
    }
  };
  
  const extracted = service.extractContactData(mockContact);
  
  if (extracted.id === '123' &&
      extracted.firstName === 'John' &&
      extracted.lastName === 'Doe' &&
      extracted.email === 'john@example.com' &&
      extracted.company === 'Test Corp' &&
      extracted.jobTitle === 'CEO') {
    console.log('✓ HubSpotService.extractContactData: Correctly extracts contact data');
  } else {
    console.log('✗ HubSpotService.extractContactData: Failed to extract data correctly');
    testsPass = false;
  }
} catch (error) {
  console.log('✗ HubSpotService.extractContactData test failed -', error.message);
  testsPass = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (testsPass) {
  console.log('✓ All validation tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some validation tests failed');
  process.exit(1);
}
