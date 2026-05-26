---
title: 滑动窗口——中等
date: 2026-05-26T14:52:00+08:00
draft: false
categories:
  - 滑动窗口
tags:
  - LeetCode
---
无重复字符的最长子串

```java
public int lengthOfLongestSubstring(String s) {
        int left = 0;
        int ans = 0;
        Set<Character> chars = new HashSet<>();
        for (int right = 0; right < s.length(); right++) {
            while (chars.contains(s.charAt(right))) {
                chars.remove(s.charAt(left));
                left++;
            }
            chars.add(s.charAt(right));
            ans = Math.max(ans, right - left + 1);
        }
        return ans;
    }
```
