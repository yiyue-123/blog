---
title: 双指针——简单
date: 2026-05-28T15:30:00+08:00
draft: true
categories:
  - LeetCode
tags:
  - 双指针
---
两数之和
```java
public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> hashTable = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (hashTable.containsKey((target - nums[i]))) {
                return new int[]{hashTable.get(target - nums[i]), i};
            }
            hashTable.put(nums[i], i);
        }
        return null;
    }
```
