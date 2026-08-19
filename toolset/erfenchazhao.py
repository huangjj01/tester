# 二分的思想（每次排除一半）会用在很多别的地方——比如前面说的"
#求平方根""二分答案",那些场景根本没有现成的 index 可用，必须自己二分。

#一个判断口诀
#看到题先问自己三句：
#数据有序吗？（或答案单调吗）
#是查找 / 判断 / 求边界类问题吗？
#直接遍历会不会太慢？
#三个都"是" → 基本就是二分。
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid          # 找到，返回下标
        elif arr[mid] < target:
            left = mid + 1      # 去右半边
        else:
            right = mid - 1     # 去左半边
    return -1                   # 没找到

nums =  [1, 2, 3, 5, 5, 9]

index1 = binary_search(nums, 2)
print(index1)