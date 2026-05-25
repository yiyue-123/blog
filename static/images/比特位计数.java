package main.动态规划;

public class 比特位计数 {
    // 方法一：
    /*
    * 解题思路 : 某个数可以看成是由另一个更小的数乘以2之后加上 1或0 得来的。
    * 而在二进制中乘法被表示为将整个数向左移，但是自身的1的个数却不会发生改变。
    * 唯一会影响1的个数的就是个位数。而个位数可以通过直接和 1进行与操作得到。
    * */
    public int[] countBits1(int n) {
        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }


    // 方法二：
    /*
    * 解题思路：
    * n & (n - 1) : 会将 n 最右边的 1 给变成 0
    * 而在本题中，数组中索引为 n 的位置的数就表示数 n 中的 1 的个数
    * 所以 ans[n] = ans[n & (n - 1)] + 1
    * 即，将 n 最右边的 1 去掉的那个数的比特位计数再加上本来被去掉的那个 1 就是 n 的比特位计数
    * */
    public int[] countBits2(int n) {
        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i & (i - 1)] + 1;
        }
        return ans;
    }
}
