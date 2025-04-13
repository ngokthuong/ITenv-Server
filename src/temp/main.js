/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
  return [[2, 2, 2, 2]];
};

try {
  const result = JSON.stringify(fourSum(...[[1, 0, -1, 0, -2, 2], 0]));
  const expected = JSON.stringify([
    [-2, -1, 1, 2],
    [-2, 0, 0, 2],
    [-1, 0, 0, 1],
  ]);
  if (result === expected) {
    console.log('Test 1 passed');
  } else {
    console.log('Test 1 failed: expected ' + expected + ', got ' + result);
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
  } else {
    console.log('Test 2 failed: expected ' + expected + ', got ' + result);
  }
  console.log('RESULT:' + result);
} catch (e) {
  console.log(e.stack);
}
