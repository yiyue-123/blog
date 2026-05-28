---
title: 栈——中等
date: 2026-05-28T21:45:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 栈
---
每日温度

```java
/*
 * 解题思路 :
 * 由于温度的高低是随机的，所以不存在天然的规律。那么为了降低时间复杂度，可以选择一种可以将已经遍历过的，
 * 不符合条件的值存储起来，等到后续进行同一处理。而 栈 是很不错的选择。
 * 我们可以选择像栈里面存储温度在数组中的下标，然后依次遍历数组中的每个元素，并为它们在栈中 排序。
 * 如果我们现在遍历到的温度比栈顶的索引对应的温度还要高，那么就将栈顶的温度索引出栈，并将其对应的结果数组中的值赋值为两者索引之差。
 * 然后继续判断新的栈顶元素与当前温度的大小。如果比当前温度大，那么将当前温度入栈，等待比他更大的温度来将它出栈。
 * 如果当前温度比栈顶元素小，我们直接入栈即可，这个栈天然就是单调的。并且最后无法出栈的元素就是后续没有更高的温度。
 * 这样设计为什么是天然的单调栈？
 * 一旦遇到比栈顶元素大的，直接将栈顶出栈，并且在栈不为空的情况下，我们一直进行判断、出栈。直到在栈中找到比当前元素更大的或者栈为空，
 * 然后元素直接入栈。如果栈顶更大，那直接入栈即可。这样这个栈一定是从栈底到栈顶索引对应的数组元素越来越大。
 * */
    public int[] dailyTemperatures(int[] temperatures) {
        int[] answer = new int[temperatures.length];
        Deque<Integer> stack = new LinkedList<>();

        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int preIndex = stack.pop();
                answer[preIndex] = i - preIndex;
            }
            stack.push(i);
        }

        return answer;
    }
```
