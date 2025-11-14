'use client';

import { useState } from 'react';
import { generateGiftAssignments, getUserAssignments, validateAssignments } from '../lib/assignmentGenerator';

export default function AssignmentTester() {
  const [assignments, setAssignments] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);

  const testAssignments = () => {
    try {
      const newAssignments = generateGiftAssignments();
      const userAssignments = getUserAssignments(newAssignments);
      const validationResult = validateAssignments(newAssignments);
      
      setAssignments(userAssignments);
      setValidation(validationResult);
    } catch (error) {
      console.error('Error generating assignments:', error);
    }
  };

  const generateAndSaveAssignments = async () => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Assignments generated and saved successfully!');
        setAssignments(result.assignments);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      alert('Error calling API');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assignment Generator Tester</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAssignments}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Assignment Generation (Local)
        </button>
        
        <button
          onClick={generateAndSaveAssignments}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          Generate & Save to Database
        </button>
      </div>

      {validation && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Validation Results</h2>
          <div className={`p-4 rounded ${validation.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <p><strong>Valid:</strong> {validation.isValid ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Total Assignments:</strong> {validation.summary.totalAssignments}</p>
            <p><strong>Users Giving Correct Amount:</strong> {validation.summary.usersGivingCorrectAmount}/8</p>
            <p><strong>Users Receiving Correct Amount:</strong> {validation.summary.usersReceivingCorrectAmount}/8</p>
            <p><strong>Self Assignments:</strong> {validation.summary.selfAssignments}</p>
            
            {validation.errors.length > 0 && (
              <div className="mt-2">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {assignments && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">User Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((user: any) => (
              <div key={user.userId} className="border rounded p-4">
                <h3 className="font-bold text-lg">User {user.userId}</h3>
                <div className="mt-2">
                  <p><strong>Gives to:</strong> [{user.givesTo.join(', ')}]</p>
                  <p><strong>Receives from:</strong> [{user.receivesFrom.join(', ')}]</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
