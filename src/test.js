//1.最长递增子序列LIS [2, 5, 9, 6, 4, 7, 2, 7, 2] long increment sequence
//默认用了数组push + 二分查找 + 新数组存放老的值
//外层遍历 n  内层新数组遍历二分查找logn   所以时间复杂度为nlogn
//注意第一个元素不可换
export function getSequence(arr) {
  const result = [0];
  let p = arr.slice();//存储消息
  let len = arr.length;
  //i用作循环
  let i, j, u, v, c
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {//值不等于0   [3,4,5,1,2,8,3]
      //这里要和最后一位比较
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        result.push(i);
        p[i] = j;
        continue
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if(arrI<arr[result[u]]){//找到匹配的结果
        if(u>0){//索引大于0
          p[i] = result[u-1];//后推排列倒序p 遇到比第一个值小的值就放在result的最小值的p序列的前方以此类推
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u-1];
  while(u-->0){
    result[u]=v;
    v = p[v];
  }
  return result;
}