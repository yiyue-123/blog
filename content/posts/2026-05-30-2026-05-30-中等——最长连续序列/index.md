---
title: 中等——最长连续序列
date: 2026-05-30T22:26:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 哈希表
---
```java
/*
* 解题思路 :
* 使用哈希表来做，将数组中的元素添加到set中，天生就可以去重。
* 然后只需要找连续序列的起始点，而由于该集合中必然会包含至少一个数，
* 也就是说肯定能够找出至少一个起始点。 
* !set.contains(num - 1) 可以找出起始点，只有在这个数是起始点时，num - 1 才不会在set中。
* 后续 set.contains(currentNum + 1) 说明set中还有连续的下一个数，那么需要更新当前序列的长度、数。
* 最后当连续序列结束时，需要更新最长的连续序列的长度
* */
public int longestConsecutive(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            set.add(num);
        }
        int maxlength = 1;
        for (int num : set) {
            int currentlength = 1;
            int currentNum = 0;
            if (!set.contains(num - 1)) {
                currentNum = num;
                while (set.contains(currentNum + 1)) {
                    currentNum++;
                    currentlength++;
                }
            }
            maxlength = Math.max(maxlength, currentlength);
        }
        return maxlength;
    }
```
