---
title: 简单——反转链表
date: 2026-06-02T22:20:00+08:00
draft: false
categories:
  - LeetCode
tags:
  - 递归
---
```java
/*
* 拿链表 1 -> 2 -> 3 ，来说
* 1. head = 1，head.next = 2 != null
* 2. head = 2，head,next = 3 != null
* 3. head = 3，head.next = null <- 触发终止条件，返回 3
* 
* 返回到 2 ： newhead = 3，head = 2，head.next.next = head 其实就是 3 -> 2，
* head.next = null 是在断掉 2 -> 3。要不然会形成环。然后返回 3
* 
* 返回到 1 ： newhead = 3，head = 1，head.next.next = head 其实就是 2 -> 1，
* head.next = null 是在断掉 1 -> 2。要不然会形成环。然后返回 3
* 
* 
* 注意千万不能将 head.next.next = head，写成 newhead.next = head。因为每次反转结束其实都是返回
* 的头节点，一直没变过，一旦这样写，会导致中间的所有节点全部丢失，只会剩下头和尾。
*/

class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }
        ListNode newHead = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }
}
```
