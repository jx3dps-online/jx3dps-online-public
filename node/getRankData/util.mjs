export function transformToBoxData(originalData) {
  return originalData.map(item => {
    const values = [...item.心法统计].sort((a, b) => b - a); // 降序排序
    const count = values.length;
    
    // 定义分位计算函数
    const getSegmentMedian = (percent) => {
      const take = Math.ceil(count * percent / 100);
      const segment = values.slice(0, Math.max(take, 1)); // 至少取1个
      return calculateMedian(segment);
    };

    return {
      x: item.心法名称,
      low: getSegmentMedian(80),   // 前80%的中位数
      q1: getSegmentMedian(60),    // 前60%的中位数
      median: getSegmentMedian(40),// 前40%的中位数
      q3: getSegmentMedian(20),    // 前20%的中位数
      high: getSegmentMedian(5),    // 前5%的中位数
      max: values[0] || 0,         // 最大值
      min: values[count - 1] || 0  // 最小值
    };
  });
}

// 计算中位数辅助函数
function calculateMedian(arr) {
  if (arr.length === 0) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 1 
    ? arr[mid] 
    : Math.round((arr[mid - 1] + arr[mid]) / 2);
}
