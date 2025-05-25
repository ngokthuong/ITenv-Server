

    

  /**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function (n) {
    const a = `["((()))","(()())","(())()","()(())","()()()"]`
    return a
};


  const codeAnswer = [];
  const expectedCodeAnswer = [];
  
  

  
  try { 
    
    const result = generateParenthesis(3);
    const expected = ["((()))","(()())","(())()","()(())","()()()"];
    const actual = result;
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      console.log("Test 1 passed");
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected);
    } else {
      console.log("Test 1 failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected); 
    }
    console.log("RESULT:", JSON.stringify(actual));
  } catch (e) {
    console.log(e.stack);
  }
  

  try { 
    
    const result = generateParenthesis(1);
    const expected = ["()"];
    const actual = result;
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      console.log("Test 2 passed");
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected);
    } else {
      console.log("Test 2 failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
      codeAnswer.push(actual);
      expectedCodeAnswer.push(expected); 
    }
    console.log("RESULT:", JSON.stringify(actual));
  } catch (e) {
    console.log(e.stack);
  }
  
  
  return {
    codeAnswer,
    expectedCodeAnswer
  };
  