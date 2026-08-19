
#冒泡排序
def sort(arr):  
    n = len(arr)
    for i in range (n-1):
        swapped = False
        for j in range(n-1-i):

            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True

        if not swapped:
            break
                
nums = [5,5, 2, 9, 1, 3]
sort(nums)
    

print('最后的排序数组：', nums)


x = 2

x += 3 
print("x+3: ", x) 
x = 2  
x -= 2    # → 11
print("x-2: ", x)   # 等同 x = x + 3  → 13
x = 2
x *= 2    # → 22
print("x*2: ", x)   # 等同 x = x + 3  → 13
x = 2
x /= 4    # → 5.5
print("x/4: ", x)   # 等同 x = x + 3  → 13
x = 2
x //= 2   # → 2.0
print("x/2向下取整: ", x)   # 等同 x = x + 3  → 13
x = 2
x %= 1    # → 0.0
print("x%2取余: ", x)   # 等同 x = x + 3  → 13
x = 2
x **= 3   # → x = x ** 3
print("x的次方: ", x)   # 等同 x = x + 3  → 13

print("四舍五入后取绝对值：",abs(round(1.2)))
