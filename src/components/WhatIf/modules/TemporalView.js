import * as d3 from "d3";
// import sampleData from "../../../data/temporalChart.json"
import { SuperGroupView,
  labelColor,
  sortedIndex,
  bindElement,
  updateElement,
  translate,
  createElement,
  queryIcon,
  pinIcon,
  getParentData,
  mergeColor,
  updateChildrenNodes,
  zoomIcon,
  createIcon,
  getID
} from "@/utils";

// console.log(sampleData)
export default class TemporalView extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, tooltipIns, rootName){
    super({ width, height, moveX, moveY }, parentNode, rootName);
    this._rootName = rootName;
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, data) {
    this._mergeStatus = false;


    this._rawData = data;
    
    //issue 1：根据data自动计算label数量，并取得排序功能。
    this._labelName = data[0][0]["one_dimens"].map(d => d.name);

    this._batchName = new Array(6).fill(0).map((_, i) => "sort" + i);
    this._batchDetails = {};
    this._upidDetails = {};
    this._mergeArray = [];
    this._mingap = 5;//bar最小宽度

    for(let item in this._batchName){
      let key = this._batchName[item],
        raw = this._rawData[item];
      this._batchDetails[key] = {
        raw: raw,
        timeDomain: d3.extent(raw, d => new Date(d.toc)),
        discreteDomain: raw.map(d => d.upid),
        oldXRange: [0, 0],
        xRange: [0, 0],
        xScale: null,
        upid: raw.map(d => d.upid)
      };
      for(let index in raw){
        let obj = raw[index],
          tqOrder = sortedIndex(obj.CONTQ, true),
          t2Order = sortedIndex(obj.CONTJ, true);
        this._upidDetails[obj.upid] = obj;
        obj.dimens = {};
        obj.one_dimens.forEach((d, i) => {
          obj.dimens[d.name] = d;
          d.tqOrder = tqOrder[i];
          d.CONTQ = obj.CONTQ[i];
          d.CONTJ = obj.CONTJ[i];
          d.t2Order = t2Order[i];
          d.upid = obj.upid;
          d.toc = obj.toc;
        })
      }
      this._mergeArray.push(this._mingap * raw.length);
    }

    // console.log(this._batchDetails);
    console.log(this._upidDetails);

    this._labelDetails = {};

    for(let item in this._labelName){
      this._labelDetails[this._labelName[item]] = {
        name: this._labelName[item],
        status: this._mergeStatus,
        value: Math.random(),
        order: +item,
        y: this._viewHeight,//0
        yScale: null,
        pattern: "temporal"
      }
    }

    // console.log(this._labelDetails);
    this.#initSetting();
    this.reflow();

    return this;
  }

  #initSetting(){
    this._barWidth = 120;
    this._temporalMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._temporalHeight = 80;
    this._temporalWidth = d3.sum(this._mergeArray);
    
    this._temporal_Height = this._temporalHeight + this._temporalMargin.top + this._temporalMargin.bottom;

    this._mergeMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._mergeHeight = 20;
    this._mergeWidth = d3.sum(this._mergeArray);

    this._merge_Height = this._mergeHeight + this._mergeMargin.top + this._mergeMargin.bottom;

    this._cardMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._cardWidth = this._barWidth + this._mergeWidth + this._cardMargin.left + this._cardMargin.right;

    this._chartMargin = 15;

    this._borderStyle = { color: "#b9bbbd", rx: 3, ry: 3 };

    this._cursorIndex = 5; //当前指标

    this._isDiscrete = true;

    // Object.values(this._labelDetails).forEach(d => {
      
    // })
  }

  reflow(){ //
    // console.log("reflow 重新计算布局")
    // console.log(this._labelDetails)
    this._cardHeight = d => this._cardMargin.top + this._cardMargin.bottom
      + this._temporal_Height + (this._labelDetails[d].status ? this._merge_Height : 0);

    this.#getBatchParams();

    for(let key in this._labelDetails){
      this._labelDetails[key].height = this._cardHeight(key)
    }

    this._getInvisibleKeys();

    this._viewWidth
  }

  _getInvisibleKeys(){
    const LD = this._labelDetails;
    let keys = sortedIndex(this._labelName.map(d => LD[d].value), false),
      arr = [],
      end = this._viewHeight - this._margin.bottom;
    keys.forEach((d, i) => {
      const obj = LD[this._labelName[d]],
        prev = i > 0 ? LD[this._labelName[keys[i - 1]]] : 0;
      obj.oldy = obj.y;
      obj.order = i;
      obj.y =  (i > 0 ? prev.y + prev.height : 0) + (i > 0 ? 1 : 0 ) * this._chartMargin;
    });
    let currIndex = this._labelName[keys[this._cursorIndex]]; 

    let amendment = LD[currIndex].y;  //y修正值
    keys.forEach((d, i) => {
      const obj = LD[this._labelName[d]];
      obj.y = obj.y - amendment;
      if(i >= this._cursorIndex && obj.y + obj.height < end){
        arr.push(this._labelName[d])
      }
    })
    this._currentKeys = arr;

    // console.log(this._currentKeys)

    this._currentKeys.forEach(d => {
      let arr = Object.values(this._upidDetails).map(e => e.dimens[d]);
      LD[d].yScale = d3.scaleLinear().range([0, this._mergeHeight])
      .domain(
        [d3.min([arr.map(d => d.value), arr.map(d => d.extremum_l)].flat()) * 0.95,
          d3.max([arr.map(d => d.value), arr.map(d => d.extremum_u)].flat()) * 1.05])
        // d3.extent([arr.map(d => d.value), arr.map(d => d.extremum_l), arr.map(d => d.extremum_u)].flat()))
    })
    // console.log(keys,keys.map(d => this._labelName[d]))
    // console.log(keys,keys.map(d => this._labelName[d]), 
    // keys.map(d => this._labelDetails[this._labelName[d]]), arr, this._labelDetails);
  }

  #getBatchParams(){
    let keys = Object.keys(this._batchDetails);
    let range = Array.from(d3.cumsum(keys.map((_, i) => this._mergeArray[i])));
    range.unshift(0);
    
    let rangeArray = d3.pairs(range);
    rangeArray.forEach((d, i) => {
      let singleData = this._batchDetails[keys[i]];
      singleData.oldXRange = singleData.xRange
      singleData.xRange = d;
      singleData.xScale = this._isDiscrete 
        ? d3.scaleBand().range(d.map(e => e - d[0])).domain(singleData.discreteDomain)
        .paddingInner(0).paddingOuter(0).align(0.5)
        : d3.scaleLinear().range(d.map(e => e - d[0])).domain(singleData.timeDomain)})
  }

  render() {
    this._container.selectAll("g").remove();  // 先清空container

    this.#renderGroup();
    this.#renderDefsG();
    this.reRender();

    return this;
  }

  reRender(){
    this.reflow();
    this.#renderSingleRow();
    d3.selectAll(".labelGroup").nodes().map(d => this.#joinBatchElement(d3.select(d)));
    // this._currentKeys
    // // updateChildrenNodes(this, this._container.selectAll(".labelGroup"), this.#joinBatchElement)
    // this._container.selectAll(".labelGroup").nodes().map(d => this.#joinBatchElement(d3.select(d)))
  }

  #renderGroup(){
    this._cardGroup = this._container.append("g")
      .attr("class", "cardGroup")
      .attr("transform", translate([200, 0]))
      .call(g => g.append("rect")
        .attr("stroke", "none")
        .attr("fill", "white")
        .attr("height", this._viewHeight - this._margin.top - this._margin.bottom)
        .attr("width", this._cardWidth))
      .on("wheel", e => {
        let n = this._cursorIndex;

        e.stopPropagation();
        e.preventDefault();

        if(n < this._labelName.length - 1 && n > 0){
          this._cursorIndex += (e.deltaY > 0 ? 1 : -1);
        }else if(n == 0){
          this._cursorIndex += (e.deltaY > 0 ? 1 : 0);
        }else if(n == this._labelName.length - 1){
          this._cursorIndex += (e.deltaY > 0 ? 0 : -1);
        }else{
          return;
        }
        this.reRender();
      })
    this.#renderTestGroup()
  }

  #renderTestGroup({
    buttonAttrs = {
      color: "#303133",
      cursor: "pointer",
      rx: 5,
      ry: 5,
      "stroke-width": 0.5,
      height: 18,
      width: 40,
      stroke: "rgb(148, 167, 183)",
      fill: "white"
    },
    textAttrs = {
      x: 20,
      y: 12,
      cursor: "pointer",
      "font-size": "10px",
      "font-family": "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
      "text-anchor": "middle",
      fill: "#94a7b7"
    }
  } = {}){
    this._container
      .call(g => g.append("g")
        .attr("transform", translate([50, 20]))
          .call(g => updateElement(g.append("rect"), buttonAttrs))
          .call(g => createElement(g, "text", textAttrs).text("discrete"))
          .on("click", () =>{
            this._isDiscrete = !this._isDiscrete;
            this.reRender();
          }))
      .call(g => g.append("g")
        .attr("transform", translate([0, 20]))
          .call(g => updateElement(g.append("rect"), buttonAttrs))
          .call(g => createElement(g, "text", textAttrs).text("merge"))
          .on("click", () => {
            this._mergeStatus = !this._mergeStatus;
            for(let item in this._labelName){
              this._labelDetails[this._labelName[item]].status = this._mergeStatus;
            };
            this.reRender();
          }))
      .call(g => g.append("g")
        .attr("transform", translate([0, 50]))
          .call(g => updateElement(g.append("rect"), buttonAttrs))
          .call(g => createElement(g, "text", textAttrs).text("temporal"))
          .on("click", () => {
            for(let item in this._labelDetails){
              this._labelDetails[item].pattern  = "temporal";
            };
            this.reRender();
          }))
      .call(g => g.append("g")
        .attr("transform", translate([50, 50]))
          .call(g => updateElement(g.append("rect"), buttonAttrs))
          .call(g => createElement(g, "text", textAttrs).text("river"))
          .on("click", () => {
            for(let item in this._labelDetails){
              this._labelDetails[item].pattern = "river";
            };
            this.reRender();
          }))
  }

  #renderDefsG(){
    const defsG = this._container.append("g")
			.attr("class", "defsG");
    defsG.append("defs")
      .call(g => g.append("filter")
        .attr("id", "card-shadow")
          .call(g => g.append("feDropShadow")
            .attr("dx",0)
            .attr("dy", 0)
            .attr("stdDeviation", 2.5)
            .attr("flood-color", "#bfbdbd")))//#ededed
      .call(g => g.append("filter")
        .attr("id", "batch-shadow")
          .call(g => g.append("feDropShadow")
            .attr("dx",0)
            .attr("dy", 0)
            .attr("stdDeviation", 1)
            .attr("flood-color", "#bfbdbd")));//#ededed
      const markerBoxWidth = 5;
      const markerBoxHeight = 5;
      const refX = markerBoxWidth / 2;
      const refY = markerBoxHeight / 2;
      const markerWidth = markerBoxWidth / 2;
      const markerHeight = markerBoxHeight / 2;
      const arrowPoints = [[0, 0], [0, 5], [5, 2.5]];
    defsG
    .call(g => g.append("defs")
      .append("marker")
      .attr("id", "shape-arrow")
      .attr("viewBox", [0, 0, markerBoxWidth, markerBoxHeight])
      .attr("refX", refX)
      .attr("refY", refY)
      .attr("markerWidth", markerBoxWidth)
      .attr("markerHeight", markerBoxHeight)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", d3.line()(arrowPoints))
      .attr("fill", labelColor[0])
      .attr("stroke", mergeColor[0]))
  }

  #renderSingleRow({
    groupAttrs = {
      transform: d => translate([0, this._labelDetails[d].y]),
      class: "labelGroup",
      opacity: 1
    },
    updateGroupFunc = g => updateElement(g, groupAttrs),
    cardAttrs = {
      height: d => this._labelDetails[d].height,
      class: "outerBox",
      width: this._cardWidth,
      stroke: this._borderStyle.color,
      "stroke-width": 0.25,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#card-shadow)"
    },
    barGroupAttrs = {
      transform: translate([this._cardMargin.left , this._cardMargin.top]),
      height: d => this._labelDetails[d].height - this._cardMargin.top - this._cardMargin.bottom,
      class: "barBorder",
      width: this._barWidth - 10,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    }
  } = {}){
    
    // const t = d3.transition().duration(750);
    this._cardGroup.selectAll(".labelGroup").data(this._currentKeys, d => d)
      .join(
        enter => enter.append("g")
          .attr("transform", d => translate([0, this._labelDetails[d].oldy]))
          .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
          .call(tar => createElement(tar, "rect", cardAttrs))
          .call(tar => createElement(tar, "rect", barGroupAttrs))
          .call(tar => this.#joinBatchElement(tar))
          .call(tar => this.#joinBarElement(tar))
          .call(tar => this.#joinZoomIcon(tar))
          .call(tar => this.#joinPinIcon(tar))
          .call(tar => this.#joinQueryIcon(tar)),
        update => update
          .transition().duration(500).ease(d3.easeLinear)
          .call(updateGroupFunc)
          .call(tar => updateElement(tar.selectAll(".outerBox"), cardAttrs))
          .call(tar => updateElement(tar.selectAll(".barBorder"), barGroupAttrs))
          ,
        exit => exit.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc).remove())
      .on("mouseenter", (e, d) => {
        let group = d3.select(e.target),
          zoom = group.selectAll(".zoomIcon"),
          pin = group.selectAll(".pinIcon"),
          func = g => g.attr("visibility", "visible")
          .transition().duration(250).ease(d3.easeLinear)
          .attr("transform", function(){return d3.select(this).attr("newY")});
        [zoom, pin].map(func);
        // d3.selectAll(".labelGroup")
        //   // .transition().duration(250).ease(d3.easeLinear)
        //   .attr("opacity", f => d !== f ? 0.6 : 1)
        console.log("mouseenter", d)
      })
      .on("mouseleave", (e, d) => {
        let group = d3.select(e.target),
          zoom = group.selectAll(".zoomIcon"),
          pin = group.selectAll(".pinIcon"),
          func = g => g
          .transition().duration(250).ease(d3.easeLinear)
          .attr("transform", function(){return d3.select(this).attr("oldY")})
          .transition().attr("visibility", "hidden");
        [zoom, pin].map(func);
        // d3.selectAll(".labelGroup")
        //   // .transition().duration(250).ease(d3.easeLinear)
        //   .attr("opacity", 1)
        console.log("mouseleave", d)
      })
  }

  #joinBatchElement(group, {
    context = this,
    groupAttrs = {
      transform: d => translate([this._batchDetails[d].xRange[0] + this._cardMargin.left + this._barWidth, this._cardMargin.top]),
      class: function(d){return `label_${getParentData(this, 1)} batch_${d} batchElement`}
    },
    updateGroupFunc = g => updateElement(g, groupAttrs),
    cardAttrs = {
      height: function(){ return context._labelDetails[getParentData(this, 2)].height 
        - context._cardMargin.top - context._cardMargin.bottom},
      class: "renderBox",
      label: function(){return context._labelDetails[getParentData(this, 2)].height},
      width: d => this._batchDetails[d].xRange[1] - this._batchDetails[d].xRange[0],
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    },
    areaAttrs = {
      d: function(d){
        let label = getParentData(this, 2), batch = d;
        return d3.area().x(e => context._batchDetails[batch].xScale(context._isDiscrete ? e.upid : new Date(e.toc)))
        .y0(e => context._labelDetails[label].yScale(e.l))
        .y1(e => context._labelDetails[label].yScale(e.u))
        (context._batchDetails[batch].upid.map(e => context._upidDetails[e].dimens[label]))
      },
      class: "mergeArea",
      opacity: 0.5,
      fill: "#B9C6CD"
    },
    lineAttrs = {
      // transform: translate(this._mergeMargin.left, this._mergeMargin.top),
      class: "mergeLine",
      stroke: "#B9C6CD",
      "stroke-width": 1,
      fill: "none",
      d: function(d){
        let label = getParentData(this, 2), batch = d;
        return d3.line()
          .y(e => context._labelDetails[label].yScale(e.value))
          .x(e => context._batchDetails[batch].xScale(context._isDiscrete ? e.upid : new Date(e.toc)))
          .curve(d3.curveLinear)
          (context._batchDetails[batch].upid.map(e => context._upidDetails[e].dimens[label]))
      }
    },
    circleAttrs = {
      class: "mergeCircle",
      r: 1.5,
      "fill": "white",
      id: d => `badSteel_${d.upid}`,
      "stroke-width": 1,
      "stroke": "#e3ad92",
      transform: function(d){
        let label = d.name, batch = getParentData(this, 1);
        return translate([context._batchDetails[batch].xScale(context._isDiscrete ? d.upid : new Date(d.toc)), 
          context._labelDetails[label].yScale(d.value)])
      }
    }
  } = {}){
    const key = group.data();
    function generateFunc(pattern){
      switch (pattern) 
      { 
        case "river":
          d3.select(this)
          .call(tar => createElement(tar, "path", lineAttrs))
          .call(tar => createElement(tar, "path", areaAttrs))
          .call(tar => tar.selectAll(".mergeCircle").data(function(d){
            let label = getParentData(this, 1), batch = d;
            let arr = context._batchDetails[batch].upid
              .map(e => context._upidDetails[e].dimens[label])
              .filter(d => d.extremum_l > d.value || d.extremum_u < d.value);//console.log(label, batch, arr);
            return arr;
          }).join("circle").call(g => updateElement(g, circleAttrs))); 
        break; 
        case "temporal":
          ; 
        break; 
      }
    }
    group.selectAll(`.label_${key}`).data(this._batchName, d => d)
    .join(
      enter => enter.append("g")
        // .attr("transform", d => translate([0, this._batchDetails[d].oldXRange[0]]))
        .call(updateGroupFunc)
        .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
        .call(tar => createElement(tar, "rect", cardAttrs))
        .attr("label", function(){
          let label = getParentData(this, 1), //getParentData(this, 1), getParentData(this, 0)
            pattern = context._labelDetails[label].pattern;
          generateFunc.call(this, pattern);
        }),
      update => update.transition().duration(500).ease(d3.easeLinear)
        .call(updateGroupFunc)
        .call(tar => updateElement(tar.selectAll(".renderBox"), cardAttrs))
        .attr("label", function(){
          let label = getParentData(this, 1), //getParentData(this, 1), getParentData(this, 0)
            pattern = context._labelDetails[label].pattern;
          switch (pattern) 
          { 
            case "river":
              if(d3.select(this).selectAll(".mergeLine").data().length === 0){
                generateFunc.call(this, "river")
              }else{
                d3.select(this).transition().duration(500).ease(d3.easeLinear)
                .call(tar => updateElement(tar.selectAll(".mergeLine"), lineAttrs))
                .call(tar => updateElement(tar.selectAll(".mergeArea"), areaAttrs))
                .call(tar => updateElement(tar.selectAll(".mergeCircle"), circleAttrs));
              }
            break; 
            case "temporal":
              if(d3.select(this).selectAll(".mergeLine").data().length === 0){
                
              }else{
                [".mergeLine", ".mergeArea", ".mergeCircle"].map(d =>  d3.select(this).selectAll(d).remove());
                generateFunc.call(this, "temporal")
              }; 
            break; 
          }
        })
        ,
      exit => exit
        // .transition().duration(500).ease(d3.easeLinear)
        //   .call(updateGroupFunc)
        .remove()
        )
        .on("click", (e, d) => {
          console.log(d)
          console.log("click", e, e.target, d3.pointer(e))
        })
        // .transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc)
  }

  #joinBarElement(group, {
    groupAttrs = {
      transform: translate([this._cardMargin.left , this._cardMargin.top]),
      class: "barElement"
    },
    options = {
      xAccessor : d => (d.x0 + d.x1)/2,
      yAccessor : d => d.length,
      // height : 50,
      width: this._barWidth - 10,
      yType : d3.scaleLinear, // y-scale type
      // color : "currentColor" // bar fill color
    }
  } = {}){
    let context = this;
    group
    .append("g")
    .call(g => updateElement(g, groupAttrs))
    .each(function(d){
        let arr = Object.values(context._upidDetails).map(e => e.dimens[d].value),
          data = d3.bin().thresholds(20)(arr),
          container = d3.select(this),
          xDomain = [data[0].x0, data[data.length - 1].x1],
          height = context._labelDetails[d].height - context._cardMargin.top - context._cardMargin.bottom,
          bad = d3.bin().thresholds(10)(Object.values(context._upidDetails).filter(e => e.fqc_label === 0).map(e => e.dimens[d].value)),
          good = d3.bin().thresholds(10)(Object.values(context._upidDetails).filter(e => e.fqc_label === 1).map(e => e.dimens[d].value));
          // ymax = Math.max(d3.max(good, d => d.length), d3.max(bad, d => d.length));
        d3.select(this).call(g => updateElement(g, groupAttrs));
        new barView(Object.assign({
          container: container,
          data: [bad, good],
          status: d3.max(good, d => d.length) > d3.max(bad, d => d.length),//data number Boolen
          xDomain,
          height,
          // yDomain: [0, ymax],
          color: mergeColor,
          opacity: [0.5, 0.8]
        }, options)).render()
      })
      // .selectAll(".indexBar").data(d => this)
    // // console.log(group.data())"temp_uniformity_entry_pre"
    // console.log(Object.values(this._upidDetails).map(d => d.dimens["temp_uniformity_entry_pre"].value))
    // console.log(Object.values(this._upidDetails).filter(d => d.fqc_label === 0).map(d => d.dimens["temp_uniformity_entry_pre"].value))
    // console.log(Object.values(this._upidDetails).filter(d => d.fqc_label === 1).map(d => d.dimens["temp_uniformity_entry_pre"].value))
  }

  #joinQueryIcon(group, {
    iconAttrs = {
      transform: translate(this._cardWidth - 20, 0),
      class: "iconDetails queryIcon",
      cursor: "pointer",
      oldY: translate(this._cardWidth - 20, 0),
      newY: translate(this._cardWidth - 20, 0)
    },
    circleAttrs = {
      "fill": "white",
      "stroke": "black",
      "stroke-width": 0.25,
      "r": 10,
      "filter": "url(#card-shadow)"
    },
    queryAttrs = {
      "fill": "#53abe5",
      d: d => queryIcon[d],
    }
  } = {}){
    const icon = createElement(group, "g", iconAttrs);
    icon
      .call(icon => createElement(icon, "circle", circleAttrs))
    icon.append("g")
      .attr("transform", "translate(-10, -10) scale(0.02)")
      .call(g => g.selectAll("path")
        .data([0, 1]).join("path")
        .call(g => updateElement(g, queryAttrs)))
    icon.on("click", (e, d) => {
      this._labelDetails[d].status = !this._labelDetails[d].status;
      this.reRender();
    })
  }

  #joinPinIcon(group, {
    iconAttrs = {
      transform: translate(this._cardWidth - 20, 0),
      class: "iconDetails pinIcon",
      cursor: "pointer",
      visibility: "hidden",
      oldY: translate(this._cardWidth - 20, 0),
      newY: translate(this._cardWidth - 50, 0)
    },
    circleAttrs = {
      "fill": "white",
      "stroke": "black",
      "stroke-width": 0.25,
      "r": 10,
      "filter": "url(#card-shadow)"
    },
    queryAttrs = {
      "fill": "#53abe5",
      d: pinIcon,
    }
  } = {}){
    const icon = createElement(group, "g", iconAttrs);
    icon
      .call(icon => createElement(icon, "circle", circleAttrs))
    icon.append("g")
      .attr("transform", "translate(-5.5, -6.5) scale(0.013)")
      .append("path")
      .call(g => updateElement(g, queryAttrs))
    icon.on("click", (e, d) => {
      // this._labelDetails[d].status = !this._labelDetails[d].status;
      // this.reflow();
    })
  }

  #joinZoomIcon(group, {
    iconAttrs = {
      transform: translate(this._cardWidth - 20, 0),
      class: "iconDetails zoomIcon",
      cursor: "pointer",
      visibility: "hidden",
      oldY: translate(this._cardWidth - 20, 0),
      newY: translate(this._cardWidth - 80, 0)
    },
    circleAttrs = {
      "fill": "white",
      "stroke": "black",
      "stroke-width": 0.25,
      "r": 10,
      "filter": "url(#card-shadow)"
    },
    queryAttrs = {
      "fill": "#53abe5",
      d: zoomIcon,
    }
  } = {}){
    const icon = createElement(group, "g", iconAttrs);
    icon
      .call(icon => createElement(icon, "circle", circleAttrs))
    icon.append("g")
      .attr("transform", "translate(-6.2, -6.8) scale(0.013)")
      .append("path")
      .call(g => updateElement(g, queryAttrs))
    icon.on("click", (e, d) => {
      console.log(d)
      this._labelDetails[d].pattern = "river";
      this.reRender();
    })
  }
}

class barView{
  constructor(obj){
    this._options = {
      data : null,
      container : null,
      xAccessor : (d, i) => i, // given d in data, returns the (ordinal) x-value
      yAccessor : d => d, // given d in data, returns the (quantitative) y-value
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

    this._uid = getID();
    console.log(this._uid)
    console.log(this);
    // if(data.length === 1){
    //   console.log(data)
    //   // let key = 
    //   // data.unshift()
    // }
  }

  _initScale(){
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
    this._initScale();
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