---
title: 简单——和为 K 的子数组
date: 2026-05-30T22:25:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 哈希表
---
```java
/*
* 解题思路 :
* 我们对索引为 i 的数组元素，我们求其前缀和（这个数自身以及其之前的所有数的和），
* 那么我们要求的结果 j ~ i 的和为 k。即 sum[i] - sum[j - 1] = k
* 所以只需要将每一个前缀和存入HashMap中即可，key为和的值，value为和出现的次数（一个和可能有多个数都能得出来）
* */
public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        // 对HashMap初始化。初始前缀和为0，出现1次。
        map.put(0, 1);
        int ans = 0;
        int sum = 0;
        for(int num : nums) {
            sum += num;
            if (map.containsKey(sum - k)) {
                ans += map.get(sum - k);
            }
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return ans;
    }
```
