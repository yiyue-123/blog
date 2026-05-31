---
title: 中等——搜索旋转排序数组
date: 2026-05-31T17:48:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 二分查找
---
```java
/*
* 解题思路 :
* 由于本题的有序数组被旋转了，所以旋转后的数组中必然存在一个断崖点（突然由大变小，原来是由小变大），
* 所以，如果我们随机的原数组分成两组不同的数组，那么必然会有一组是有序的。
* 我们只需要找出那一组有序的，并判断target是否在其中。
* 如果在其中，我们缩小范围进行查找。否则去另一数组查找。
* 切换数组与缩小范围均通过边界left和right实现。
*/
public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
```
