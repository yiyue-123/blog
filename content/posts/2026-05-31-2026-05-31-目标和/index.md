---
title: 中等——目标和
date: 2026-05-31T11:07:00+08:00
draft: false
categories:
  - "#回溯#动态规划"
tags:
  - LeetCode
---
方法一 : 回溯

```java
/*
* 解题思路 :
* 要解决这种列出全部可能或者组合的题，在数据量不大的情况下，通常回溯都十分适合。
* 将所有的可能（一个数为 正 或 负 的情况）全部列出，然后筛选符合条件的情况。
* 所以 回溯 + 递归 用来解决这道题十分合适。
* 回溯 : 筛选合适的结果
* 递归 : 处理所有的可能
*/
class Solution {
    int ans = 0;

    public int findTargetSumWays(int[] nums, int target) {
        backTrack(nums, target, 0, 0);
        return ans;
    }

    public void backTrack(int[] nums, int target, int index, int sum) {
        // 判断结果是否符合条件
        if (index >= nums.length) {
            if (sum == target) {
                ans++;
            }
            return;
        }
      
        // 递归处理一个数的两种结果
        backTrack(nums, target, index + 1, sum + nums[index]);
        backTrack(nums, target, index + 1, sum - nums[index]);
    }
}
```

方法二 : 动态规划

```java
/*
* 解题思路 : 
* 因为数组中的所有数都是非负数，那么所有的数求和 sum。
* 因为是给数组中的数从 正 或 负 中选择一个符号，那么将最终的表达式移项，
* 结果可以看成 所有正数的和 - 所有负数的和。
* 
* 设负数的和为 neg ，那么正数的和为 sum - neg 。因为所有数的和为 sum
* 最后我们要求的 target = (sum - neg) - neg ，即 2neg = sum - target。
* 那么我们先对数组中的所有数求和，即可得 sum。再减去 target，得到所需要的负数和的2倍。
* 
* 如果 sum - target < 0，说明数组中所有的数加起来都没有达到要求，也不能有符合要求的了。
* 如果 (sum - target) % 2 != 0，说明两者相差的不是偶数，刚刚的推导结果得到两者相减最后必然是偶数。
* 这种情况也不符合要求
* 
* 现在定义 dp[i][j] : i表示数组中的前i个数。j表示和为多少（就是上面的neg）。
* 肯定能确定的（初始化） dp[0][0] = 0。
* 由于最后一次选择肯定是整个数组都要参与，那么我们需要的i为nums.length。和最大为neg。
* 所以定义数组是初始化容量 new int[nums.length + 1][neg + 1]。要取到两个值
* 
* 如果现在我们遍历到了数组中的某个数 num，要求的负数和为 j。
* 我们有两种选择：
* 1.选择将这个 num 放入负数组，那么还要求的 j 只剩下 j - num。因为有一个 num 已经确定在负数组。
* 
* 2.不将这个 num 放入负数组，也就是将它加入正数组。也就是默认在这个数以前我们已经凑出来了 j。
* 因为 : target是确定的，只要凑够 neg，那么剩下的数一定是正数组的。前提是 num < j
* 
* 最后递推公式 : dp[i][j] = dp[i - 1][j] + dp[i - 1][j - num]
* num = nums[i]。
* dp[i - 1][j] : 表示当前 num 不放入负数组。默认除了这个数的，其余数（其实就是前 i - 1 个数）已经
* 凑够了j
* dp[i - 1][j - num] : 表示将当前 num 放入负数组，那么前面 i - 1 个数只需要凑 j - num就够了。
*/

class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int num : nums) {
            sum += num;
        }

        int diff = sum - target;
        if (diff < 0 || diff % 2 != 0) {
            return 0;
        }

        int neg = diff / 2;
        int[][] dp = new int[nums.length + 1][neg + 1];
        dp[0][0] = 1;
        

        for (int i = 1; i <= nums.length; i++) {
            int num = nums[i - 1];
            for (int j = 0; j <= neg; j++) {
                dp[i][j] = dp[i - 1][j];
                if (j >= num) {
                    dp[i][j] += dp[i - 1][j - num];
                }
            }
        }

        return dp[nums.length][neg];
    }
}
```

方法三 : 动态规划 + 滚动数组

> ```java
> /*
> * 这里我们发现数组空间还可以优化，即原来的 dp[i][j] 优化成了 dp[i]。
> * dp[i] : 表示在 已经处理过的子数组 中，选出和为 i 的选法。
> for (int num : nums) {
>    for (int j = neg; j >= num; j--) {
>       dp[j] += dp[j - num];
>    }
> }
> * 使用 for 循环来遍历，已处理的子数组一目了然。
> * 然后判断 j >= num ，判断当前数能不能放到负数组，如果不能那么就保持原址就好。
> * 如果能够放进去，那么需要将这种情况加上。
> */
> class Solution {
>     public int findTargetSumWays(int[] nums, int target) {
>         int sum = 0;
>         for (int num : nums) {
>             sum += num;
>         }
>         int diff = sum - target;
>         if (diff < 0 || diff % 2 != 0) {
>             return 0;
>         }
>         int neg = diff / 2;
>         int[] dp = new int[neg + 1];
>         dp[0] = 1;
>         for (int num : nums) {
>             for (int j = neg; j >= num; j--) {
>                 dp[j] += dp[j - num];
>             }
>         }
>         return dp[neg];
>     }
> }
> ```
