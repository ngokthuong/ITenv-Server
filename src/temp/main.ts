// ===== User Code =====
function twoSum(nums: number[], target: number): number[] {
  return [0, 1];
}

// ===== Result Arrays =====
const codeAnswer = [];
const expectedCodeAnswer = [];

// ===== Test Cases =====

try {
  const result = twoSum(...[[2, 7, 11, 15], 9]);
  const expected = '[0,1]';
  if (JSON.stringify(result) === JSON.stringify(expected)) {
    console.log('✅ Test 1 passed');
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  } else {
    console.log(
      '❌ Test 1 failed: expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(result),
    );
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  }
  console.log('RESULT:', JSON.stringify(result));
} catch (e: any) {
  console.error('❗ Error in test 1:', e.stack);
}

try {
  const result = twoSum(...[[3, 2, 4], 6]);
  const expected = '[1,2]';
  if (JSON.stringify(result) === JSON.stringify(expected)) {
    console.log('✅ Test 2 passed');
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  } else {
    console.log(
      '❌ Test 2 failed: expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(result),
    );
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  }
  console.log('RESULT:', JSON.stringify(result));
} catch (e: any) {
  console.error('❗ Error in test 2:', e.stack);
}

// ===== Export for Validation =====
module.exports = {
  codeAnswer,
  expectedCodeAnswer,
};
