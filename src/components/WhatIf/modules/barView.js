import * as d3 from "d3";
import {
  getRandomID,
  createElement,
  updateElement,
  translate
} from '@/utils'
export class barView{
  constructor(obj){
    this._options = {
      data : null,
      container : null,
      xAccessor : d => (d.x0 + d.x1)/2, // given d in data, returns the (ordinal) x-value
      yAccessor : d => d.length, // given d in data, returns the (quantitative) y-value
      marginTop : 1, // the top margin, in pixels
      marginRight : 5, // the right margin, in pixels
      marginBottom : 0, // the bottom margin, in pixels
      marginLeft : 5, // the left margin, in pixels
      width : 200, // the outer width of the chart, in pixels
      height : 50, // the outer height of the chart, in pixels
      xRange : () => [this._marginLeft, this._width - this._marginRight], // [left, right]
      yType : d3.scaleLinear, // y-scale type
      xDomain : [0, 1], // [xmin, xmax]
      // yDomain: null, // [ymin, ymax]
      yRange : () => [this._height - this._marginBottom, this._marginTop], // [bottom, top]
      color : "currentColor", // river fill color
      opacity : 1
    };
    let options = Object.assign(this._options, obj);
    for(let item in options){
      if(typeof options[item] === "function" && options[item].length === 0){
        this["_" + item] = options[item]();
      }else{
        this["_" + item] = options[item];
      }
    }

    this._uid = getRandomID();

    if(this._data[0].length === 1 || this._data[1].length === 1){
      console.warn("这是一个警告信息 该指标所有值相等", this._data);
    }
  }

  #initScale(){
     // Compute values.
    // console.log(data)
    const X = d3.map(this._data.flat(), this._xAccessor);
    const Y = d3.map(this._data.flat(), this._yAccessor);
    // console.log("x, y", X, Y);
  
    // Compute default domains, and unique the x-domain.
    if (this._xDomain === undefined) this._xDomain = d3.extent(X);
    if (this._yDomain === undefined) this._yDomain = [0, d3.max(Y)];
    // console.log("xDomain, yDomain", xDomain, yDomain);
  
    // Construct scales, axes, and formats.
    this._xScale = d3.scaleLinear().range(this._xRange).domain(this._xDomain);
    this._yScale = d3.scaleLinear().range(this._yRange).domain(this._yDomain);
    // console.log("xScale, yScale", data.map(x).map(d => xScale(d)), data.map(y).map(d => yScale(d)));

    // area function.
    this._area = d3.area()
      .x(d => this._xScale(this._xAccessor(d)))
      .y1(d => this._yScale(this._yAccessor(d)))
      .y0(this._height - this._marginBottom)
      .curve(d3.curveMonotoneX);
  }

  render(){
    this.#initScale();
    this._container
      .append("rect")
      .attr("height", this._height)
      .attr("width", this._width)
      .attr("class", "background" + this._uid)
      .attr("fill", "white")
      .attr("opacity", 0);
    this._container.selectAll('path').data([0, 1]).join('path')
      .attr("class", "riverChart" + this._uid)
      .attr("fill", d => this._color[d])
      .attr("opacity", d =>  this._opacity[d])
      .attr("d", d => this._area(this._data[d]));
    return this;
  }
  reRender(options, t = d3.transition().duration(300)){
    for(let item in options){
      this["_" + item] = options[item];
    }
    this.initScale()
    this._container.select(".background" + this._uid)
      .transition(t)
      .attr("height", this._height)
      .attr("width", this._width)
    this._container.select(".riverChart" + this._uid)
      .transition(t)
      .attr("fill", d => this._color[d])
      .attr("opacity", d =>  this._opacity[d])
      .attr("d", d => this._area(this._data[d]));
  }
}


export class riverView{
  constructor(obj){
    this._options = {
      container: null,
      xIndex: 0,
      yIndex: 0,
      yScale: null,
      xScale: null,
      xAccessor: null,
      yAccessor: null,
      step: 0,
      lineDatum: [],
      filterFunc: null,  // boolen
      pattern: 'river' //
    };
    let options = Object.assign(this._options, obj);
    for(let item in options){
      if(typeof options[item] === "function" && options[item].length === 0){
        this["_" + item] = options[item]();
      }else{
        this["_" + item] = options[item];
      }
    }

    // this._uid = getRandomID();
  }

  #initScale(){

  }

  #initAttrs(){
    this._lineAttrs = {
      class: "mergeLine",
      stroke: "#B9C6CD",
      "stroke-width": 1,
      fill: "none",
      d: d3.line()
        .y(e => this._yScale(this._yAccessor(e)))
        .x((e, f) => this._xScale(this._xAccessor(e)) + (f === this._lineDatum.length - 1 ? this._step : 0))
        .curve(d3.curveLinear)
        (this._lineDatum)
    };

    this._areaAttrs = {
      d: d3.area()
      .y0(e => this._yScale(e.l))
      .y1(e => this._yScale(e.u))
      .x((e, f) => this._xScale(this._xAccessor(e)) + (f === this._lineDatum.length - 1 ? this._step : 0))
      (this._lineDatum),
      class: "mergeArea",
      opacity: 0.5,
      fill: "#B9C6CD"
    };

    this._circleAttrs = {
      class: "mergeCircle",
      r: 1.5,
      "fill": "white",
      id: d => `badSteel_${d.upid}`,
      "stroke-width": 1,
      "stroke": "#e3ad92",
      transform: d => translate([this._xScale(this._xAccessor(d)), this._yScale(this._yAccessor(d))])
    }
  }

  render(){
    this.#initScale();
    this.#initAttrs();
    if(this._pattern === 'river'){
      this.#renderRiver()
    }else if(this._pattern === 'temporal'){
      this.#renderTemporal()  //temporal View
    }
    return this;
  }

  #renderRiver(){
    this._container
    .call(tar => createElement(tar, "path", this._areaAttrs))
    .call(tar => createElement(tar, "path", this._lineAttrs))
    .call(tar => tar.selectAll(".mergeCircle")
      .data(this._lineDatum.filter(this._filterFunc))
      .join("circle")
      .call(g => updateElement(g, this._circleAttrs)));
  }

  #renderTemporal(){

  }

  updateRiver(options, t = d3.transition().duration(300)){
    let flag = false;
    if(options.pattern !== this._pattern)flag = true;
    for(let item in options){
      this["_" + item] = options[item];
    }
    this.#initScale();
    this.#initAttrs();
    if(flag){
      if(this._pattern === 'river'){
        this.#renderRiver()
      }else if(this._pattern === 'temporal'){
        [".mergeLine", ".mergeArea", ".mergeCircle"].map(d =>  this._container.selectAll(d).remove());
        this.#renderTemporal()
      }
    }else{
      if(this._pattern === 'river'){
        this._container
          .transition(t)
          .call(tar => updateElement(tar.select(".mergeArea"), this._areaAttrs))
          .call(tar => updateElement(tar.select(".mergeLine"), this._lineAttrs))
          .call(g => updateElement(g.selectAll('.mergeCircle'), this._circleAttrs))
      }else if(this._pattern === 'temporal'){
        // [".mergeLine", ".mergeArea", ".mergeCircle"].map(d =>  this._container.selectAll(d).remove());
        // this.#renderTemporal()
      }
      
    }
    
  }
}