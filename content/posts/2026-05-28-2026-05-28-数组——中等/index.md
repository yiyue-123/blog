---
title: 数组——中等
date: 2026-05-28T16:02:00+08:00
draft: false
categories:
  - 数组、前缀积与后缀积
tags:
  - LeetCode
---
除自身外数组的乘积
```java
/*
    * 解题思路：使用常规的嵌套for循环会导致时间复杂度较高达到O(n^2)，不合题意
    * 因此在解决类似的数组不包含自身的乘积问题时，可以选择使用前缀积乘以后缀积来解决
    * 前缀积：数组中该数之前的所有数的乘积（不包含该数）
    * 后缀积：数组中该数之后的所有数的乘积
    * 最终结果 = 前缀积 * 后缀积
    * 由于数组中的第一个元素之前无元素，因此需要手动将该数的前缀积设置为1
    * 后缀积也是类似的情况
    * */
    public int[] productExceptSelf(int[] nums) {
        int[] results =  new int[nums.length];
        int countZero = 0;
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            results[i] = 0;
            if (nums[i] == 0) {
                list.add(i);
                countZero++;
            }
        }
        if (countZero > 1) {
            for (int i = 0; i < nums.length; i++) {
                results[i] = 0;
            }
        } else if (countZero == 1) {
            int index = list.get(0);
            results[index] = 1;
            for (int i = 0; i < nums.length; i++) {
                if (i != index)
                    results[index] *= nums[i];
            }
        } else {
            results[0] = 1;
            for (int i = 1; i < nums.length; i++) {
                results[i] = results[i - 1] * nums[i - 1];
            }
            int suffixProduct = 1;
            // 巧妙地解题思路，到乘以后缀积获得最终结果时选择了从后往前相乘，顺便更新后缀积。避免了使用额外的存储空间来存储后缀积的结果。
            for (int i = nums.length - 1; i >= 0; i--) {
                results[i] = results[i] * suffixProduct;
                suffixProduct *= nums[i];
            }

        }
        return results;
    }
```
