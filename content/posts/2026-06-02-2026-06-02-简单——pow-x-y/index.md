---
title: 简单——pow(x,y)
date: 2026-06-02T23:03:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - "#快速幂#递归"
---
```java
class Solution {
    public double myPow(double x, int n) {
        long N = n;
        return N >= 0 ? quickPow(x, N) : 1.0 / quickPow(x, -N);
    }

    public double quickPow(double x, long n) {
        if (n == 0) {
            return 1.0;
        }
        double y = quickPow(x, n / 2);
        return n % 2 == 0 ? y * y : y * y * x;
    }
}
```
