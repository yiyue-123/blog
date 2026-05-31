---
title: 中等——在排序数组中查找元素的第一个和最后一个位置
date: 2026-05-31T16:51:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 二分查找
---
```java
/*
* 解决思路 : 
* 可以使用二分查找先定位到目标元素，然后再去找它的起始位置与结束位置。
if (nums[mid] == target) {
  ans = mid;
  if (isFirst) {
    right = mid - 1;
  } else {
    left = mid + 1;
  }
}
* 上面这段代码就是寻找相同连续元素的起始、结束位置的关键。
* 如果在第一次找到目标元素时，判断这次是不是在寻找起始位置，如果是那么从刚刚元素的左边中去找；
* 如果不是，那么就是要找结束位置，去刚刚元素的右边中去找。
*/
public int[] searchRange(int[] nums, int target) {
      int first = findBound(nums, target, true);
      int last  = findBound(nums, target, false);
      return new int[]{first, last};
  }

  private int findBound(int[] nums, int target, boolean isFirst) {
      int left = 0, right = nums.length - 1, ans = -1;
      while (left <= right) {
          int mid = left + (right - left) / 2;
          if (nums[mid] == target) {
              ans = mid;
              if (isFirst) {
                  right = mid - 1;
              } else {
                  left = mid + 1;
              }
          } else if (nums[mid] < target) {
              left = mid + 1;
          } else {
              right = mid - 1;
          }
      }
      return ans;
  }
```
