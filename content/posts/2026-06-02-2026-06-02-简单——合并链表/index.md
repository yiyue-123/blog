---
title: 简单——合并链表
date: 2026-06-02T22:39:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 递归
---
```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null || list2 == null) {
            return list1 == null ? list2 : list1;
        }
        if (list1.val < list2.val) {
            list1.next = mergeTwoLists(list1.next, list2);
            return list1;
        } else {
            list2.next = mergeTwoLists(list1, list2.next);
            return list2;
        }
    }
```
