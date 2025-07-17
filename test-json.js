#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the habittrackerpro JSON
const jsonPath = path.join(__dirname, 'habittrackerpro-onboarding-flow.json');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(jsonContent);

console.log('=== HabitTrackerPro JSON Analysis ===');
console.log('Total steps found:', data.steps.length);
console.log('Steps:');

data.steps.forEach((step, index) => {
  console.log(`${index + 1}. ${step.stepName} (${step.layoutType})`);
  if (step.flowEnd) {
    console.log('   → flowEnd: true');
  }
});

// Also check the FreelancePM JSON for comparison
const freelancePath = path.join(__dirname, 'freelancepm-onboarding-flow.json');
if (fs.existsSync(freelancePath)) {
  const freelanceContent = fs.readFileSync(freelancePath, 'utf8');
  const freelanceData = JSON.parse(freelanceContent);
  
  console.log('\n=== FreelancePM JSON Analysis ===');
  console.log('Total steps found:', freelanceData.steps.length);
  console.log('Steps:');
  
  freelanceData.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.stepName} (${step.layoutType})`);
    if (step.flowEnd) {
      console.log('   → flowEnd: true');
    }
  });
}