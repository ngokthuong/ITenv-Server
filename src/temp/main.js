/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {};

const codeAnswer = [];
const expectedCodeAnswer = [];

try {
  const result = JSON.stringify(fourSum(...[[1, 0, -1, 0, -2, 2], 0]));
  const expected = JSON.stringify([
    [-2, -1, 1, 2],
    [-2, 0, 0, 2],
    [-1, 0, 0, 1],
  ]);
  if (result === expected) {
    console.log('Test 1 passed');
    codeAnswer.push(result);
    expectedCodeAnswer.push(result);
  } else {
    console.log('Test 1 failed: expected ' + expected + ', got ' + result);
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  }
  console.log('RESULT:' + result);
} catch (e) {
  console.log(e.stack);
}

try {
  const result = JSON.stringify(fourSum(...[[2, 2, 2, 2, 2], 8]));
  const expected = JSON.stringify([[2, 2, 2, 2]]);
  if (result === expected) {
    console.log('Test 2 passed');
    codeAnswer.push(result);
    expectedCodeAnswer.push(result);
  } else {
    console.log('Test 2 failed: expected ' + expected + ', got ' + result);
    codeAnswer.push(result);
    expectedCodeAnswer.push(expected);
  }
  console.log('RESULT:' + result);
} catch (e) {
  console.log(e.stack);
}

return {
  codeAnswer,
  expectedCodeAnswer,
};
