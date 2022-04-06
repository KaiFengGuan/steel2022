import { ref, watch } from 'vue';
import { SuperSVGView } from '@/utils/renderClass';
import { GillSans } from '@/utils';

export const dir = {
  up: 'up',
  down: 'down'
};

function pathShape(direction, box, horizon, vertical, w, h /* w h 是那个尖儿的底和高 */) {
  let point = [
    [0, 0], [-w/2, -h], [-box.width/2 - horizon, -h],
    [-box.width/2 - horizon, -box.height - vertical*4],
    [box.width/2 + horizon, -box.height - vertical*4],
    [box.width/2 + horizon, -h], [w/2, -h], [0, 0]
  ]

  if (direction === dir.down) {
    point = point.map(d => [d[0], -d[1]]);
  }
  return `M${point.join("L")}Z`;
}

export default class TooltipClass extends SuperSVGView {
  // w: svg初始宽度; h: svg初始高度; ele: svg挂载的父节点; tooltip: svg的id
  constructor ({ width, height }, ele, tooltipId) {
    super({ width, height }, ele);

    this._container.attr('id', tooltipId);
    this._tipViews = false;
    this._tipOptions = {};
    this._tooltipId = tooltipId;

    this._direction = dir.up; // tooltip在鼠标的上方还是下方
    this._contentId = '';   // tooltip内容id值
    this._toolBox = null;   // 内容尺寸记录
  }

  showTooltip(options){
    if (this._tipViews) throw Error(`已存在id为${this._tooltipId}的提示框, 请先移除或者重新实例化一个!`);

    this._tipViews = true;
    this._tipOptions = options;
    this.#watchTipView();
    return this;
  }

  removeTooltip(){
    this._tipViews = false;
    this.#watchTipView();
    return this;
  }

  #watchTipView() {
    const { paintChart, removeChart } = this.#useTooltip();
    this._tipViews ? paintChart() : removeChart();
  }

  #useTooltip() {
    let timer = null;
    const that = this;
    
    function paintChart() {
      if (timer)  clearTimeout(timer);

      that._container.attr('display', 'block');
      that._createToolTip(that._tipOptions, that._container);
    }
  
    function removeChart() {
      timer = setTimeout(()=> {
        that._container.attr('display', 'none');
      }, 0);
    }
  
    return {
      paintChart,
      removeChart,
    }
  }

  _createToolTip({
    id = Math.random().toString(),  // 指定 id
    background = 'white',
    stroke =  '#ccc',
    displayText = true,   // true: 挂载文字, tspan生效 | false: 挂载group, chartFun生效
    tspan = [1, 2, 3],
    chartFun = null,      // 柯里化后的函数, 最后一个参数是group, 绘制的内容挂载在该group下
    vertical = 10,        // vertical padding
    horizon = 10,         // horizon padding
    boxWidth = 10,        // 尖角的宽度
    boxHeight = boxWidth * 1.732,
    x = 500,
    y = 500,
    box = { width: 0, height: 0 },  // 挂载group时需要指定box尺寸
    direction = dir.up,
    color = 'black',
    fontSize = `12px`,
    fontFamily = GillSans,
  } = {}, parentNode) {
    if (this._contentId === id && this._direction === direction) { // 优化: 不是每次都要重绘
      let toolBox = this._toolBox;
      if (direction === dir.up) {
        parentNode
          .style('top', `${y - toolBox.height}px`)
          .style('left', `${x - toolBox.width/2}px`);
      } else {
        parentNode
          .style('top', `${y - 10}px`)
          .style('left', `${x - toolBox.width/2}px`);
      }
      return;
    }

    parentNode.selectAll('*').remove();
    console.log('id变更了', '方向是: ', direction)
    this._contentId = id;
    this._direction = direction;
    const tooltip = parentNode
      .append('g')
      .attr('class', 'tooltip')
      .style('font', '12px DIN');
    
    const path = tooltip.append('path')
      .attr('stroke', stroke)
      .attr('fill', background);
    
    // 画内容
    let content = null;
    if (displayText) {
      content = tooltip.append('text');
      const line = content.selectAll('tspan').data(tspan)
        .join('tspan')
        .attr('x', 0)
        .attr('y', (_, i) => `${1.2 * i}em`)
        .attr('fill', color)
        .style('font-family', fontFamily)
        .style('font-size', fontSize)
        .style('font-style', 'normal')
        .text(d => d);
      
      const _box = content.node().getBBox();
      box.width = _box.width;
      box.height = _box.height;
    } else {
      content = tooltip.append('g');
      chartFun(content);
    }

    // 画背景
    path.attr('d', pathShape(direction, box, horizon, vertical, boxWidth, boxHeight));
    
    // 对齐
    if (direction === dir.up) {
      content.attr('transform', `translate(${[-box.width/2, -(box.height + vertical + boxHeight)]})`);
      const toolBox = tooltip.node().getBBox();
      parentNode
        .style('position', 'absolute')
        .style('height', toolBox.height)
        .style('width', toolBox.width);
      tooltip
        .attr('transform', `translate(${[toolBox.width/2, toolBox.height]})`)
      parentNode
        .style('top', `${y - toolBox.height}px`)
        .style('left', `${x - toolBox.width/2}px`);
      this._toolBox = toolBox;
    } else {
      content.attr('transform', `translate(${[-box.width/2, vertical + boxHeight]})`);
      const toolBox = tooltip.node().getBBox();
      parentNode
        .style('position', 'absolute')
        .style('height', toolBox.height)
        .style('width', toolBox.width);
      tooltip
        .attr('transform', `translate(${[toolBox.width/2, 0]})`)
      parentNode
        .style('top', `${y - 10}px`)
        .style('left', `${x - toolBox.width/2}px`);
      this._toolBox = toolBox;
    }
  }
}
