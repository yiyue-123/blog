---
title: 数组——中等
date: 2026-05-28T16:02:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 数组、前缀积与后缀积、前缀和
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



和为 K 的子数组

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



最长连续序列

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
