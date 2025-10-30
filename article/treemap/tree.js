<!DOCTYPE html>
<style>

form {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

svg {
  font: 10px sans-serif;
}

</style>
<svg width="960" height="570"></svg>
<form>
  <label><input type="radio" name="mode" value="sumBySize" checked> Size</label>
  <label><input type="radio" name="mode" value="sumByCount"> Count</label>
</form>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script>

// 定义svg画布
var svg = d3.select("svg"),
    // 获取svg画布宽度
    width = +svg.attr("width"),
    // 获取svg画布高度
    height = +svg.attr("height");

// 定义fader函数用来获取颜色,返回颜色字符串
// d3.interpolateCubehelix(a, b)返回a和b之间的颜色插值，0.2是修正gamma值
var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    // d3.schemeCategory20.map(fader),将d3.schemeCategory20返回的20个颜色值通过fader函数
    // 进行映射转换，最终，生成离散颜色比例尺color函数
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    // 定义一个格式函数
    format = d3.format(",d");

// 定义一个矩形树图布局函数treemap()函数
var treemap = d3.treemap()
     // 设置tile为d3.treemapResquarify，即矩形按层排列
    .tile(d3.treemapResquarify)
     // 指定布局范围 
    .size([width, height])
     // 启用边界补偿
    .round(true)
     // 指定内部间距
    .paddingInner(1);

// 读取数据
d3.json("flare.json", function(error, data) {
  if (error) throw error;

  // 生成树形层次结构的数据
  var root = d3.hierarchy(data)
      // node.eachBefore用来前序遍历树节点，对于每一个node,计算id的格式
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
      // 对节点的size属性求和
      .sum(sumBySize)
      // 对节点进行排序，按照深度或者值的大小来确定顺序
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  对root数据进行矩形树布局
  treemap(root);

  // 定义每个矩形的画布
  var cell = svg.selectAll("g")
    // 将叶子节点数据绑定到矩形元素上
    .data(root.leaves())
    .enter().append("g")
      // 设置矩形的位置
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  // 设置代表树节点的每个矩形的id,宽度，高度以及填充色
  cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      // 填充色通过父节点的id来计算，保证同一父节点的所有子节点的颜色相同
      .attr("fill", function(d) { return color(d.parent.data.id); });

  // 定义矩形上的文字裁剪元素
  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  // 为矩形上的文字使用clip-path，控制文字换行
  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });

  // 为矩形绑定title属性，并设置title显示内容
  cell.append("title")
      .text(function(d) { return d.data.id + "\n" + format(d.value); });

  // 定义两个控制按钮：按照节点的size或者节点子节点的个数进行布局排列
  d3.selectAll("input")
      .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
      .on("change", changed);

  // 定义定时器，默认以count为排列依据
  var timeout = d3.timeout(function() {
    d3.select("input[value=\"sumByCount\"]")
        .property("checked", true)
        .dispatch("change");
  }, 2000);

  // 当切换按钮被点击时，切换排列依据
  function changed(sum) {
    timeout.stop();
    // 以当前的sum方式来排列布局
    treemap(root.sum(sum));

    // 切换布局的过程动画
    cell.transition()
        .duration(750)
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
      .select("rect")
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; });
  }
});

// 对节点的子节点个数求和
function sumByCount(d) {
  return d.children ? 0 : 1;
}
// 返回节点的size属性
function sumBySize(d) {
  return d.size;
}

</script>
————————————————
版权声明：本文为CSDN博主「wan353694124」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/wan353694124/article/details/78951545