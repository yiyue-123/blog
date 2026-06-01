---
title: 中等——完全平方数
date: 2026-06-01T22:30:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 动态规划
---
```java
/*
* 解题思路 : 
* 定义 dp[] ，dp[i] 表示数 i 的完全平方和数。所以对于某个数 num，它的完全平方和为 dp[num]。
* dp[num] = dp[num - j * j] + 1。这里的 j 表示小于 num 的最大的平方数。
* 为什么要 minn = Math.min(minn, f[i - j * j]); ？
* 因为题目要求的是最少的平方数，那么如果能够将每个值取得尽量大，那么数的数量就会更少。
* 外层循环是来做小问题组成大问题的解的。内层循环是让每次取得平方数尽量大，结果才会正确
*/

class Solution {
    public int numSquares(int n) {
        int[] f = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            int minn = Integer.MAX_VALUE;
            for (int j = 1; j * j <= i; j++) {
                minn = Math.min(minn, f[i - j * j]);
            }
            f[i] = minn + 1;
        }
        return f[n];
    }
}
```
