---
title: 回文子串——中等
date: 2026-05-31T09:57:00+08:00
draft: false
categories:
  - 中心扩展法则
tags:
  - LeetCode
---
```java
/*
* 解题思路 :
* 利用中心扩展的思想，先固定字符串的中心字符
*（可能是一个也可能是两个，其实就是字符串的长度是奇数还是偶数），
* 那么从中心字符开始分别向两侧遍历。如果遍历过程中，两个位置的字符一直一样，
* 直到将整个字符串遍历完成，那么以该字符为中心的子字符串就是回文串，结果数加 1
* */
public int countSubstrings(String s) {
        int ans = 0;
  
        // 依次将字符串中的每一个字符用作中心
        for (int i = 0; i < s.length(); i++) {
            // 中心可能是 1 个（对应0），也可能是 2 个（对应1）
            for (int j = 0; j <= 1; j++) {
                int begin = i;
                int end = i + j;
                while (begin >= 0 && end < s.length() && s.charAt(begin--) == s.charAt(end++)) {
                    ans++;
                }
            }
        }
        return ans;
    }
```
