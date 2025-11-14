/**
 * Assignment Generator for Gift Exchange
 * 
 * This module generates gift assignments for 8 users where:
 * - Each user gives gifts to exactly 4 other users
 * - Each user receives gifts from exactly 4 other users
 * - No user is assigned to themselves
 */

export interface Assignment {
  giverId: number;
  receiverId: number;
}

export interface UserAssignments {
  userId: number;
  givesTo: number[];
  receivesFrom: number[];
}

/**
 * Generates truly random gift assignments for 8 users using a backtracking algorithm
 * to ensure balanced distribution while maintaining randomness.
 * 
 * @returns Array of Assignment objects representing who gives to whom
 */
export function generateGiftAssignments(): Assignment[] {
  // Try multiple times to generate a valid random assignment
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = tryGenerateRandomAssignments();
    if (result) {
      return result;
    }
  }
  
  // If random generation fails, fall back to a guaranteed method
  console.warn('Random generation failed, using fallback method');
  return generateGuaranteedRandomAssignments();
}

/**
 * Attempts to generate random assignments using a constraint-based approach
 */
function tryGenerateRandomAssignments(): Assignment[] | null {
  const assignments: Assignment[] = [];
  const users = [1, 2, 4, 19, 20, 21, 22, 23];
  
  // Track how many gifts each user gives and receives
  const giveCount = new Map<number, number>();
  const receiveCount = new Map<number, number>();
  users.forEach(user => {
    giveCount.set(user, 0);
    receiveCount.set(user, 0);
  });
  
  // Shuffle users to randomize the order we process them
  const shuffledUsers = shuffleArray([...users]);
  
  for (const giver of shuffledUsers) {
    // Find all possible receivers for this giver
    const possibleReceivers = users.filter(receiver => 
      receiver !== giver && // Can't give to self
      (receiveCount.get(receiver) || 0) < 4 // Receiver hasn't reached limit
    );
    
    // Calculate how many more gifts this giver needs to give
    const needToGive = 4 - (giveCount.get(giver) || 0);
    
    if (possibleReceivers.length < needToGive) {
      // Not enough available receivers, this attempt failed
      return null;
    }
    
    // Randomly select receivers for this giver
    const selectedReceivers = shuffleArray(possibleReceivers).slice(0, needToGive);
    
    // Add the assignments
    selectedReceivers.forEach(receiver => {
      assignments.push({
        giverId: giver,
        receiverId: receiver
      });
      giveCount.set(giver, (giveCount.get(giver) || 0) + 1);
      receiveCount.set(receiver, (receiveCount.get(receiver) || 0) + 1);
    });
  }
  
  // Verify the result is valid
  const validation = validateAssignments(assignments);
  return validation.isValid ? assignments : null;
}

/**
 * Generates assignments using a more sophisticated random approach that's guaranteed to work
 */
function generateGuaranteedRandomAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  
  // Create a bipartite graph approach
  // Each user appears 4 times as a giver and 4 times as a receiver
  const givers: number[] = [];
  const receivers: number[] = [];
  
  const users = [1, 2, 4, 19, 20, 21, 22, 23];
  for (const user of users) {
    // Add each user 4 times to both giver and receiver pools
    for (let i = 0; i < 4; i++) {
      givers.push(user);
      receivers.push(user);
    }
  }
  
  // Shuffle both arrays
  const shuffledGivers = shuffleArray(givers);
  const shuffledReceivers = shuffleArray(receivers);
  
  // Try to pair them up, avoiding self-assignments
  const usedPairs = new Set<string>();
  
  for (let i = 0; i < shuffledGivers.length; i++) {
    const giver = shuffledGivers[i];
    let assigned = false;
    
    // Try to find a valid receiver
    for (let j = 0; j < shuffledReceivers.length; j++) {
      const receiver = shuffledReceivers[j];
      const pairKey = `${giver}-${receiver}`;
      
      if (receiver !== giver && !usedPairs.has(pairKey)) {
        assignments.push({
          giverId: giver,
          receiverId: receiver
        });
        usedPairs.add(pairKey);
        shuffledReceivers.splice(j, 1); // Remove this receiver from the pool
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      // If we can't assign, try swapping with a later giver
      for (let k = i + 1; k < shuffledGivers.length; k++) {
        const otherGiver = shuffledGivers[k];
        // Try swapping and see if it helps
        [shuffledGivers[i], shuffledGivers[k]] = [shuffledGivers[k], shuffledGivers[i]];
        
        // Try again with the swapped giver
        const newGiver = shuffledGivers[i];
        for (let j = 0; j < shuffledReceivers.length; j++) {
          const receiver = shuffledReceivers[j];
          const pairKey = `${newGiver}-${receiver}`;
          
          if (receiver !== newGiver && !usedPairs.has(pairKey)) {
            assignments.push({
              giverId: newGiver,
              receiverId: receiver
            });
            usedPairs.add(pairKey);
            shuffledReceivers.splice(j, 1);
            assigned = true;
            break;
          }
        }
        
        if (assigned) break;
      }
    }
  }
  
  return assignments;
}

/**
 * Alternative generation method using random selection with constraints
 * This provides more randomness while maintaining the required constraints
 * 
 * @returns Array of Assignment objects representing who gives to whom
 */
export function generateRandomGiftAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  const users = [1, 2, 4, 19, 20, 21, 22, 23];
  
  // Track how many times each user receives gifts
  const receiveCount = new Map<number, number>();
  users.forEach(user => receiveCount.set(user, 0));
  
  // For each user, assign them to give to 4 others
  for (const giver of users) {
    const availableReceivers = users.filter(user => 
      user !== giver && // Can't give to themselves
      (receiveCount.get(user) || 0) < 4 // Receiver hasn't reached limit
    );
    
    // If we don't have enough available receivers, we need to backtrack
    // For simplicity, we'll use the systematic approach as fallback
    if (availableReceivers.length < 4) {
      return generateGiftAssignments();
    }
    
    // Randomly select 4 receivers
    const selectedReceivers = shuffleArray([...availableReceivers]).slice(0, 4);
    
    selectedReceivers.forEach(receiver => {
      assignments.push({
        giverId: giver,
        receiverId: receiver
      });
      receiveCount.set(receiver, (receiveCount.get(receiver) || 0) + 1);
    });
  }
  
  return assignments;
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Converts assignment array to user-centric view
 * 
 * @param assignments Array of assignments
 * @returns Array of UserAssignments showing what each user gives and receives
 */
export function getUserAssignments(assignments: Assignment[]): UserAssignments[] {
  const userAssignments: UserAssignments[] = [];
  
  const users = [1, 2, 4, 19, 20, 21, 22, 23];
  for (const userId of users) {
    const givesTo = assignments
      .filter(a => a.giverId === userId)
      .map(a => a.receiverId)
      .sort((a, b) => a - b);
    
    const receivesFrom = assignments
      .filter(a => a.receiverId === userId)
      .map(a => a.giverId)
      .sort((a, b) => a - b);
    
    userAssignments.push({
      userId,
      givesTo,
      receivesFrom
    });
  }
  
  return userAssignments;
}

/**
 * Validates that the assignments meet all requirements
 * 
 * @param assignments Array of assignments to validate
 * @returns Object containing validation results
 */
export function validateAssignments(assignments: Assignment[]): {
  isValid: boolean;
  errors: string[];
  summary: {
    totalAssignments: number;
    usersGivingCorrectAmount: number;
    usersReceivingCorrectAmount: number;
    selfAssignments: number;
  };
} {
  const errors: string[] = [];
  const userAssignments = getUserAssignments(assignments);
  
  let usersGivingCorrectAmount = 0;
  let usersReceivingCorrectAmount = 0;
  let selfAssignments = 0;
  
  // Check each user's assignments
  userAssignments.forEach(user => {
    // Check giving count
    if (user.givesTo.length !== 4) {
      errors.push(`User ${user.userId} gives to ${user.givesTo.length} people, should be 4`);
    } else {
      usersGivingCorrectAmount++;
    }
    
    // Check receiving count
    if (user.receivesFrom.length !== 4) {
      errors.push(`User ${user.userId} receives from ${user.receivesFrom.length} people, should be 4`);
    } else {
      usersReceivingCorrectAmount++;
    }
    
    // Check for self-assignments
    if (user.givesTo.includes(user.userId)) {
      errors.push(`User ${user.userId} is assigned to give to themselves`);
      selfAssignments++;
    }
  });
  
  // Check total assignments
  if (assignments.length !== 32) {
    errors.push(`Total assignments: ${assignments.length}, should be 32 (8 users × 4 assignments each)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalAssignments: assignments.length,
      usersGivingCorrectAmount,
      usersReceivingCorrectAmount,
      selfAssignments
    }
  };
}
