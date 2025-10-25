"use client";

import { useState } from 'react';
import { 
  generateGiftAssignments, 
  generateRandomGiftAssignments,
  getUserAssignments,
  validateAssignments,
  Assignment,
  UserAssignments
} from '../lib/assignmentGenerator';

export default function AssignmentDemo() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userAssignments, setUserAssignments] = useState<UserAssignments[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [generationType, setGenerationType] = useState<'systematic' | 'random'>('systematic');

  const generateAssignments = () => {
    const newAssignments = generationType === 'systematic' 
      ? generateGiftAssignments() 
      : generateRandomGiftAssignments();
    
    const newUserAssignments = getUserAssignments(newAssignments);
    const newValidation = validateAssignments(newAssignments);
    
    setAssignments(newAssignments);
    setUserAssignments(newUserAssignments);
    setValidation(newValidation);
  };

  const runTests = () => {
    console.log('🎄 Running Assignment Generator Tests...\n');
    
    // Test systematic generation
    console.log('Testing Systematic Generation:');
    const systematicAssignments = generateGiftAssignments();
    const systematicValidation = validateAssignments(systematicAssignments);
    console.log('Systematic validation:', systematicValidation);
    
    // Test random generation
    console.log('\nTesting Random Generation:');
    const randomAssignments = generateRandomGiftAssignments();
    const randomValidation = validateAssignments(randomAssignments);
    console.log('Random validation:', randomValidation);
    
    // Test multiple generations
    console.log('\nTesting Multiple Generations:');
    for (let i = 0; i < 5; i++) {
      const testAssignments = generateGiftAssignments();
      const testValidation = validateAssignments(testAssignments);
      console.log(`Generation ${i + 1}: ${testValidation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log('\n✨ Tests completed! Check console for detailed results.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-christmas-red via-christmas-green to-christmas-gold p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-christmas-green mb-4 flex items-center">
            🎁 Gift Assignment Generator Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demo generates gift assignments for 8 users where each user gives to 4 others and receives from 4 others.
          </p>
          
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Generation Type:</label>
              <select 
                value={generationType} 
                onChange={(e) => setGenerationType(e.target.value as 'systematic' | 'random')}
                className="border rounded px-3 py-1"
              >
                <option value="systematic">Systematic</option>
                <option value="random">Random</option>
              </select>
            </div>
            <button
              onClick={generateAssignments}
              className="bg-christmas-green text-white px-4 py-2 rounded hover:bg-christmas-green/80 transition-colors"
            >
              Generate Assignments
            </button>
            <button
              onClick={runTests}
              className="bg-christmas-red text-white px-4 py-2 rounded hover:bg-christmas-red/80 transition-colors"
            >
              Run Tests (Check Console)
            </button>
          </div>
        </div>

        {validation && (
          <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-christmas-red mb-4">Validation Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-christmas-green">
                  {validation.summary.totalAssignments}
                </div>
                <div className="text-sm text-gray-600">Total Assignments</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-christmas-green">
                  {validation.summary.usersGivingCorrectAmount}/8
                </div>
                <div className="text-sm text-gray-600">Users Giving 4</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-christmas-green">
                  {validation.summary.usersReceivingCorrectAmount}/8
                </div>
                <div className="text-sm text-gray-600">Users Receiving 4</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-christmas-red">
                  {validation.summary.selfAssignments}
                </div>
                <div className="text-sm text-gray-600">Self Assignments</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold">
                {validation.isValid ? '✅ All validations passed!' : '❌ Validation failed'}
              </div>
              {!validation.isValid && validation.errors.length > 0 && (
                <ul className="mt-2 list-disc list-inside">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {userAssignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-christmas-red mb-4">User Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userAssignments.map(user => (
                <div key={user.userId} className="border rounded-lg p-4">
                  <h3 className="text-lg font-bold text-christmas-green mb-2">
                    User {user.userId}
                  </h3>
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-700">Gives to:</div>
                    <div className="text-sm text-gray-600">
                      [{user.givesTo.join(', ')}]
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Receives from:</div>
                    <div className="text-sm text-gray-600">
                      [{user.receivesFrom.join(', ')}]
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-christmas-red mb-4">Assignment Matrix</h2>
            <p className="text-gray-600 mb-4">
              Rows represent givers, columns represent receivers. ✅ means the person gives a gift to that recipient.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100">Giver \ Receiver</th>
                    {[1,2,3,4,5,6,7,8].map(receiver => (
                      <th key={receiver} className="border p-2 bg-gray-100 text-center">
                        {receiver}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8].map(giver => (
                    <tr key={giver}>
                      <td className="border p-2 bg-gray-100 font-bold text-center">
                        {giver}
                      </td>
                      {[1,2,3,4,5,6,7,8].map(receiver => {
                        const hasAssignment = assignments.some(
                          a => a.giverId === giver && a.receiverId === receiver
                        );
                        const isSelf = giver === receiver;
                        return (
                          <td key={receiver} className={`border p-2 text-center ${
                            isSelf ? 'bg-gray-200' : hasAssignment ? 'bg-green-100' : 'bg-white'
                          }`}>
                            {isSelf ? '🚫' : hasAssignment ? '✅' : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
