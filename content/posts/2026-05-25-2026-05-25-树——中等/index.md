---
title: 树——中等
date: 2026-05-25T21:46:00+08:00
draft: true
categories:
  - 树
tags:
  - LeetCode
---
验证二叉搜索树

```java
public boolean isValidBST(TreeNode root) {
        return judgeBST(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    /*
    在判断是否时二叉搜索树时，除了判断当前节点与父节点的关系之外，还要注意和父节点以上的节点
    保持关系。所以可以在判断当前节点的合法性时将判断的范围添加上去。这样就能够精确判断当前节点
    是否合法。
    解题关键： node.val <= lower || node.upper 都返回false。搜索树中不允许出现重复的节点。
    并且lower和upper会随着递归的深入而更新，而不是一直保持原值。
    */
    public boolean judgeBST(TreeNode node, long lower, long upper) {
        if (node == null) {
            return true;
        }
        if (node.val <= lower || node.val >= upper) {
            return false;
        }
        return judgeBST(node.left, lower, node.val) && judgeBST(node.right, node.val, upper);
    }
```
