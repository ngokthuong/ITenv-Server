
    #include <vector>
    #include <iostream>
    #include <string>
    #include <sstream>
    using namespace std;
  
    class Solution {
public:
    vector<string> generateParenthesis(int n) {
        
    }
};
  
    template <typename T>
    void printValue(const T& value) {
        std::cout << value;
    }
  
    template <typename T>
    void printValue(const std::vector<T>& vec) {
        std::cout << "[";
        for (size_t i = 0; i < vec.size(); ++i) {
            printValue(vec[i]);
            if (i != vec.size() - 1) std::cout << ",";
        }
        std::cout << "]";
    }
  
    template <typename T>
    void printValue(const std::vector<std::vector<T>>& vec) {
        std::cout << "[";
        for (size_t i = 0; i < vec.size(); ++i) {
            printValue(vec[i]);
            if (i != vec.size() - 1) std::cout << ",";
        }
        std::cout << "]";
    }
  
    std::string vectorToJson(const std::vector<int>& vec) {
        std::ostringstream oss;
        oss << "[";
        for (size_t i = 0; i < vec.size(); ++i) {
            oss << vec[i];
            if (i != vec.size() - 1) oss << ",";
        }
        oss << "]";
        return oss.str();
    }
  
    std::string vectorsToJson(const std::vector<std::vector<int>>& vecs) {
        std::ostringstream oss;
        oss << "[";
        for (size_t i = 0; i < vecs.size(); ++i) {
            oss << vectorToJson(vecs[i]);
            if (i != vecs.size() - 1) oss << ",";
        }
        oss << "]";
        return oss.str();
    }
  
    int main() {
        std::vector<std::vector<int>> results;
        std::vector<std::vector<int>> expecteds;
  
        
      try {
        Solution sol;
        // Solution sol;
        std::vector<int> nums = undefined;
        auto result = sol.generateParenthesis(nums, undefined);
        auto expected = std::vector<int>{((())), (()()), (())(), ()(()), ()()()};
        results.push_back(result);
        expecteds.push_back(expected);
  
        if (result == expected) {
          std::cout << "✅ Test 1 passed" << std::endl;
        } else {
          std::cout << "❌ Test 1 failed: expected ";
          printValue(expected);
          std::cout << ", got ";
          printValue(result);
          std::cout << std::endl;
        }
        std::cout << "RESULT: ";
        printValue(result);
        std::cout << std::endl;
      } catch (const std::exception& e) {
        std::cout << "❗ Error in test 1: " << e.what() << std::endl;
      }

      try {
        Solution sol;
        // Solution sol;
        std::vector<int> nums = undefined;
        auto result = sol.generateParenthesis(nums, undefined);
        auto expected = std::vector<int>{()};
        results.push_back(result);
        expecteds.push_back(expected);
  
        if (result == expected) {
          std::cout << "✅ Test 2 passed" << std::endl;
        } else {
          std::cout << "❌ Test 2 failed: expected ";
          printValue(expected);
          std::cout << ", got ";
          printValue(result);
          std::cout << std::endl;
        }
        std::cout << "RESULT: ";
        printValue(result);
        std::cout << std::endl;
      } catch (const std::exception& e) {
        std::cout << "❗ Error in test 2: " << e.what() << std::endl;
      }

      try {
        Solution sol;
        // Solution sol;
        std::vector<int> nums = undefined;
        auto result = sol.generateParenthesis(nums, undefined);
        auto expected = std::vector<int>{(()), ()()};
        results.push_back(result);
        expecteds.push_back(expected);
  
        if (result == expected) {
          std::cout << "✅ Test 3 passed" << std::endl;
        } else {
          std::cout << "❌ Test 3 failed: expected ";
          printValue(expected);
          std::cout << ", got ";
          printValue(result);
          std::cout << std::endl;
        }
        std::cout << "RESULT: ";
        printValue(result);
        std::cout << std::endl;
      } catch (const std::exception& e) {
        std::cout << "❗ Error in test 3: " << e.what() << std::endl;
      }

      try {
        Solution sol;
        // Solution sol;
        std::vector<int> nums = undefined;
        auto result = sol.generateParenthesis(nums, undefined);
        auto expected = std::vector<int>{(((()))), ((()())), ((())()), ((()))(), (()(())), (()()()), (()())(), (())(()), (())()(), ()((())), ()(()()), ()(())(), ()()(()), ()()()()};
        results.push_back(result);
        expecteds.push_back(expected);
  
        if (result == expected) {
          std::cout << "✅ Test 4 passed" << std::endl;
        } else {
          std::cout << "❌ Test 4 failed: expected ";
          printValue(expected);
          std::cout << ", got ";
          printValue(result);
          std::cout << std::endl;
        }
        std::cout << "RESULT: ";
        printValue(result);
        std::cout << std::endl;
      } catch (const std::exception& e) {
        std::cout << "❗ Error in test 4: " << e.what() << std::endl;
      }

      try {
        Solution sol;
        // Solution sol;
        std::vector<int> nums = undefined;
        auto result = sol.generateParenthesis(nums, undefined);
        auto expected = std::vector<int>{};
        results.push_back(result);
        expecteds.push_back(expected);
  
        if (result == expected) {
          std::cout << "✅ Test 5 passed" << std::endl;
        } else {
          std::cout << "❌ Test 5 failed: expected ";
          printValue(expected);
          std::cout << ", got ";
          printValue(result);
          std::cout << std::endl;
        }
        std::cout << "RESULT: ";
        printValue(result);
        std::cout << std::endl;
      } catch (const std::exception& e) {
        std::cout << "❗ Error in test 5: " << e.what() << std::endl;
      }
  
        std::cout << "Results: " << vectorsToJson(results) << std::endl;
        std::cout << "Expecteds: " << vectorsToJson(expecteds) << std::endl;
  
        return 0;
    }
    