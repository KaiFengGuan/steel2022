import { SuperSVGView } from '@/utils/renderClass';
import { ref, watch } from 'vue';



export class TooltipClass extends SuperSVGView {
  // w: svg初始宽度; h: svg初始高度; ele: svg挂载的父节点; tooltip: svg的id
  constructor ({ width, height }, ele, tooltipId) {
    super({ width, height }, ele);

    this._container.attr('id', tooltipId);
    this._tipViews = false;
    this._tipOptions = {};
    this._tooltipId = tooltipId;
  }

  showTooltip(options){
    if (!this._tipViews) throw Error(`已存在id为${this._tooltipId}的提示框, 请先移除或者重新实例化一个!`);

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
    
    console.log('in tooltip watch')

    const { paintChart, removeChart } = this.#useTooltip();
    this._tipViews ? paintChart() : removeChart();
  }

  #useTooltip() {
    const timer = null;
    const that = this;
    
    function paintChart() {
      if (timer)  clearTimeout(timer);

      console.log('tooltip paintChart')
      that._container.attr('display', 'block');
      that._createToolTip({}, that._container);
    }
  
    function removeChart() {
      timer = setTimeout(()=> {
        that._container.attr('display', 'none');
      }, 50);
    }
  
    return {
      paintChart,
      removeChart,
    }
  }

  _createToolTip({
    background = 'pink',
    stroke =  'rgba(148, 167, 183, 0.4)',
    tspan = [1, 2, 3],
    vertical = 10,
    horizon = 8,
    x = 500,
    y = 500,
    boxWidth = 5,
    fill = 'red',
    fontSize = `12px`,
    boxHeight = 5 * 1.732
  } = {}, parentNode) {
    parentNode.selectAll('*').remove();
    
    const tooltip = parentNode
            .append('g')
            .attr('class', 'tooltip')
            .style('font', '12px DIN');
    
    const path = tooltip.append('path')
      .attr('stroke', stroke)
      .attr('fill', background);
    
    const text = tooltip.append('text');
    
    const line = text.selectAll('tspan').data(tspan)
      .join('tspan')
      .attr('x', 0)
      .attr('y', (_, i) => `${1.2 * i}em`)
      .attr('fill', fill)
      .style('font-family', 'Din')//(GillSans, "white", "12px", "bold", "normal")
      .style('font-size', fontSize)
      // .style('font-weight', 'bold')
      .style('font-style', 'normal')
      .text(d => d);
    const box = text.node().getBBox();				
    path.attr('d', `
      M${- vertical - box.width/2},${- boxHeight}
      H${-boxWidth}l${boxWidth},${boxHeight}l${boxWidth},-${boxHeight}
      H${box.width/2 + vertical}
      v-${box.height + 2 * horizon}
      h-${box.width + 2 * vertical}
      z
    `)
    text.attr('transform', `translate(${[-box.width/2, -boxHeight/2 - box.height]})`);
    
    const toolBox = tooltip.node().getBBox();
    parentNode
      .style('height', toolBox.height)
      .style('width', toolBox.width);
    tooltip.attr('transform', `translate(${[toolBox.width/2, toolBox.height]})`)
    parentNode.style('top', `${y - toolBox.height}px`).style('left', `${x - toolBox.width/2}px`);
    // const bigBox = path.node().getBBox();
    // path.attr('transform', `translate(${[0, - horizon + boxHeight]})`);
  }
}
