// ===== User Code =====
function twoSum(nums, target) {
  return [0, 1];
}
// ===== Result Arrays =====
var codeAnswer = [];
var expectedCodeAnswer = [];
// ===== Test Cases =====
try {
  var result = twoSum.apply(void 0, [[2, 7, 11, 15], 9]);
  var expected = '[0,1]';
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
} catch (e) {
  console.error('❗ Error in test 1:', e.stack);
}
try {
  var result = twoSum.apply(void 0, [[3, 2, 4], 6]);
  var expected = '[1,2]';
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
} catch (e) {
  console.error('❗ Error in test 2:', e.stack);
}
// ===== Export for Validation =====
module.exports = {
  codeAnswer: codeAnswer,
  expectedCodeAnswer: expectedCodeAnswer,
};
