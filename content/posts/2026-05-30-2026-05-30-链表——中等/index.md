---
title: 链表——中等
date: 2026-05-30T15:13:00+08:00
draft: false
categories:
  - 排序
tags:
  - LeetCode
---
排序链表

```java
/*
* 解题思路 :
* 寻找链表的中点，然后将链表分为左右两个分别排序，最后合并排序好的两个链表
* */

public ListNode sortList(ListNode head) {
      if (head == null || head.next == null) {
          return head;
      }

      // 1. 找中点
      ListNode slow = head, fast = head.next;
      while (fast != null && fast.next != null) {
          slow = slow.next;
          fast = fast.next.next;
      }

      // 2. 断开
      ListNode mid = slow.next;
      slow.next = null;

      // 3. 递归排序 + 合并
      ListNode left = sortList(head); 
      ListNode right = sortList(mid);
      return merge(left, right);
  }

  ListNode merge(ListNode l1, ListNode l2) {
      ListNode dummy = new ListNode(0);
      ListNode cur = dummy;
      while (l1 != null && l2 != null) {
          if (l1.val < l2.val) {
              cur.next = l1;
              l1 = l1.next;
          } else {
              cur.next = l2;
              l2 = l2.next;
          }
          cur = cur.next;
      }
      cur.next = (l1 != null) ? l1 : l2;
      return dummy.next;
  }
```
