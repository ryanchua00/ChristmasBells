/**
 * Test suite for Assignment Generator
 * 
 * This file contains tests to verify that the gift assignment generation
 * works correctly and meets all requirements.
 */

import {
  generateGiftAssignments,
  generateRandomGiftAssignments,
  getUserAssignments,
  validateAssignments,
  Assignment,
  UserAssignments
} from './assignmentGenerator';

/**
 * Test the systematic assignment generation
 */
export function testSystematicAssignments(): void {
  console.log('🧪 Testing Systematic Assignment Generation...\n');
  
  const assignments = generateGiftAssignments();
  const validation = validateAssignments(assignments);
  const userAssignments = getUserAssignments(assignments);
  
  // Print results
  console.log('📊 Assignment Results:');
  console.log(`Total assignments: ${validation.summary.totalAssignments}`);
  console.log(`Users giving correct amount (4): ${validation.summary.usersGivingCorrectAmount}/8`);
  console.log(`Users receiving correct amount (4): ${validation.summary.usersReceivingCorrectAmount}/8`);
  console.log(`Self-assignments: ${validation.summary.selfAssignments}`);
  console.log(`Valid: ${validation.isValid ? '✅' : '❌'}\n`);
  
  if (!validation.isValid) {
    console.log('❌ Validation Errors:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
    console.log('');
  }
  
  // Print detailed user assignments
  console.log('👥 User Assignment Details:');
  userAssignments.forEach(user => {
    console.log(`User ${user.userId}:`);
    console.log(`  Gives to: [${user.givesTo.join(', ')}]`);
    console.log(`  Receives from: [${user.receivesFrom.join(', ')}]`);
  });
  console.log('');
}

/**
 * Test the random assignment generation
 */
export function testRandomAssignments(): void {
  console.log('🎲 Testing Random Assignment Generation...\n');
  
  const assignments = generateRandomGiftAssignments();
  const validation = validateAssignments(assignments);
  const userAssignments = getUserAssignments(assignments);
  
  // Print results
  console.log('📊 Random Assignment Results:');
  console.log(`Total assignments: ${validation.summary.totalAssignments}`);
  console.log(`Users giving correct amount (4): ${validation.summary.usersGivingCorrectAmount}/8`);
  console.log(`Users receiving correct amount (4): ${validation.summary.usersReceivingCorrectAmount}/8`);
  console.log(`Self-assignments: ${validation.summary.selfAssignments}`);
  console.log(`Valid: ${validation.isValid ? '✅' : '❌'}\n`);
  
  if (!validation.isValid) {
    console.log('❌ Validation Errors:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
    console.log('');
  }
}

/**
 * Test assignment validation with known good and bad data
 */
export function testValidation(): void {
  console.log('🔍 Testing Assignment Validation...\n');
  
  // Test with valid assignments
  const validAssignments: Assignment[] = [
    { giverId: 1, receiverId: 2 },
    { giverId: 1, receiverId: 4 },
    { giverId: 1, receiverId: 19 },
    { giverId: 1, receiverId: 20 },
    { giverId: 2, receiverId: 1 },
    { giverId: 2, receiverId: 4 },
    { giverId: 2, receiverId: 19 },
    { giverId: 2, receiverId: 20 },
    // ... (would need 32 total for complete test)
  ];
  
  // Test with invalid assignments (self-assignment)
  const invalidAssignments: Assignment[] = [
    { giverId: 1, receiverId: 1 }, // Self-assignment - should be invalid
    { giverId: 1, receiverId: 2 },
    { giverId: 1, receiverId: 4 },
    { giverId: 1, receiverId: 19 },
  ];
  
  console.log('Testing invalid assignments (with self-assignment):');
  const invalidValidation = validateAssignments(invalidAssignments);
  console.log(`Valid: ${invalidValidation.isValid ? '✅' : '❌'}`);
  if (!invalidValidation.isValid) {
    console.log('Expected errors found:');
    invalidValidation.errors.forEach(error => console.log(`  - ${error}`));
  }
  console.log('');
}

/**
 * Test multiple generations to ensure consistency
 */
export function testMultipleGenerations(): void {
  console.log('🔄 Testing Multiple Generations for Consistency...\n');
  
  const results = [];
  for (let i = 0; i < 5; i++) {
    const assignments = generateGiftAssignments();
    const validation = validateAssignments(assignments);
    results.push(validation.isValid);
    console.log(`Generation ${i + 1}: ${validation.isValid ? '✅' : '❌'}`);
  }
  
  const allValid = results.every(result => result);
  console.log(`\nAll generations valid: ${allValid ? '✅' : '❌'}\n`);
}

/**
 * Analyze assignment distribution to check for patterns
 */
export function analyzeAssignmentDistribution(): void {
  console.log('📈 Analyzing Assignment Distribution...\n');
  
  const assignments = generateGiftAssignments();
  const userAssignments = getUserAssignments(assignments);
  
  // Create a giving matrix to visualize who gives to whom
  console.log('Giving Matrix (rows give to columns):');
  console.log('   1  2  4 19 20 21 22 23');
  
  const users = [1, 2, 4, 19, 20, 21, 22, 23];
  for (const giver of users) {
    let row = `${giver.toString().padStart(2)}: `;
    for (const receiver of users) {
      const gives = assignments.some(a => a.giverId === giver && a.receiverId === receiver);
      row += gives ? 'X ' : '. ';
    }
    console.log(row);
  }
  console.log('');
  
  // Check for balanced distribution
  const givingCounts = new Map<number, number>();
  const receivingCounts = new Map<number, number>();
  for (const user of users) {
    givingCounts.set(user, userAssignments.find(u => u.userId === user)?.givesTo.length || 0);
    receivingCounts.set(user, userAssignments.find(u => u.userId === user)?.receivesFrom.length || 0);
  }
  
  console.log('Distribution Summary:');
  console.log('User | Gives | Receives');
  console.log('-----|-------|--------');
  for (const user of users) {
    console.log(`${user.toString().padStart(3)} |   ${givingCounts.get(user)}   |    ${receivingCounts.get(user)}`);
  }
  console.log('');
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  console.log('🎄 Gift Assignment Generator Tests\n');
  console.log('='.repeat(50));
  console.log('');
  
  testSystematicAssignments();
  console.log('-'.repeat(50));
  testRandomAssignments();
  console.log('-'.repeat(50));
  testValidation();
  console.log('-'.repeat(50));
  testMultipleGenerations();
  console.log('-'.repeat(50));
  analyzeAssignmentDistribution();
  
  console.log('✨ All tests completed!');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).assignmentTests = {
    runAllTests,
    testSystematicAssignments,
    testRandomAssignments,
    testValidation,
    testMultipleGenerations,
    analyzeAssignmentDistribution
  };
}
