#!/usr/bin/env node

// This simulates the exact logic the plugin uses to process steps
const fs = require('fs');
const path = require('path');

// Mock the JsonValidator logic (simplified)
function validateAndNormalizeFlow(jsonData) {
  const data = JSON.parse(jsonData);
  
  // This mimics the actual plugin logic
  let steps;
  if (data.steps) {
    steps = data.steps;
  } else {
    throw new Error('No steps found');
  }
  
  console.log('Raw steps from JSON:', steps.length);
  steps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step.stepName} (${step.layoutType})`);
    if (step.flowEnd) {
      console.log('     → flowEnd: true');
    }
  });
  
  // Normalize steps (this is what the plugin actually does)
  const normalizedSteps = steps.map(step => ({
    stepName: step.stepName,
    layoutType: step.layoutType,
    headline: step.headline,
    subtitle: step.subtitle,
    marketingCopy: step.marketingCopy,
    cta: step.cta,
    ctaType: step.ctaType,
    flowEnd: step.flowEnd,
    inputFields: step.inputFields
  }));
  
  return { steps: normalizedSteps };
}

// Mock the main plugin processing loop
function simulatePluginProcessing(flow) {
  console.log('\n=== Plugin Processing Simulation ===');
  console.log(`Processing ${flow.steps.length} steps...`);
  
  const generatedFrames = [];
  
  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    console.log(`\nStep ${i + 1}/${flow.steps.length}: ${step.stepName}`);
    console.log(`  Layout: ${step.layoutType}`);
    console.log(`  FlowEnd: ${step.flowEnd || false}`);
    
    // Simulate frame generation
    const frameName = `${step.stepName} - ${step.layoutType}`;
    generatedFrames.push(frameName);
    console.log(`  ✓ Generated frame: ${frameName}`);
  }
  
  console.log(`\n=== Results ===`);
  console.log(`Total frames generated: ${generatedFrames.length}`);
  generatedFrames.forEach((frame, index) => {
    console.log(`  ${index + 1}. ${frame}`);
  });
  
  return generatedFrames;
}

// Test with HabitTrackerPro JSON
const jsonPath = path.join(__dirname, 'habittrackerpro-onboarding-flow.json');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');

try {
  const flow = validateAndNormalizeFlow(jsonContent);
  const frames = simulatePluginProcessing(flow);
  
  console.log(`\n=== Conclusion ===`);
  console.log(`The plugin SHOULD generate ${frames.length} screens for HabitTrackerPro`);
  console.log(`This includes the final step with flowEnd: true`);
  
} catch (error) {
  console.error('Error:', error.message);
}