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
  createIcon
} from "@/utils";

import { barView, labelName, riverView } from "./barView";

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
    if(this._rawData === undefined){ //初始化
      this._batchName = data.map(d => d.id);
      this._rawData = data.map(d => d.data);
      //issue 1：根据data自动计算label数量，并取得排序功能。
      this._labelName = labelName;
      // console.log("initData", data)
    }else{  //更新数据
      let newData = {};
      for(let item in data){
        newData[data[item].id] = data[item].data;
      }
      // console.log("updateData")
      this.updateData(data.map(d => d.id), newData);
      return this;
    }

    this._mergeStatus = false;
    this._batchDetails = {};
    this._upidDetails = {};
    this._mergeArray = [];
    this._mingap = 5;//bar最小宽度

    for(let item in this._batchName){
      let key = this._batchName[item],
        datum = this._rawData[item];
      this._batchDetails[key] = {
        raw: datum,
        timeDomain: d3.extent(datum, d => new Date(d.toc)),
        discreteDomain: datum.map(d => d.upid),
        oldXRange: [0, 0],
        xRange: [0, 0],
        xScale: null,
        upid: datum.map(d => d.upid),
        width: datum.length * this._mingap
      };
      // console.log(datum)
      for(let index in datum){
        // console.log(datum[index].upid)
        let obj = datum[index],
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
      this._mergeArray.push(this._batchDetails[key].width);
    }

    // console.log(this._batchDetails);
    // console.log(this._upidDetails);
    // console.log(this._mergeArray);

    this._labelDetails = {};

    for(let item in this._labelName){
      this._labelDetails[this._labelName[item]] = {
        name: this._labelName[item],
        status: this._mergeStatus,
        value: Math.random(),
        order: +item,
        y: this._viewHeight,
        yScale: null,
        pattern: "temporal"
      }
    }

    this._barInstances = {};
    this._riverInstances = {};
    this.#initSetting();
    this.reflow();

    this.render();

    return this;
  }

  updateData(newBatch, newData){

    let leftBatch = [...d3.intersection(this._batchName, newBatch)],
      removeKeys = [...d3.difference(this._batchName, leftBatch)],
      newKeys = [...d3.difference(newBatch, leftBatch)];

    this._batchName = newBatch;
    
    this._mergeArray = [];
    this._mingap = 5;//bar最小宽度

    for(let item in removeKeys){
      this._batchDetails[removeKeys[item]].upid.map(d => delete this._upidDetails[d]);
      delete this._batchDetails[removeKeys[item]];
    }

    for(let item in newKeys){
      let key = newKeys[item],
        datum = newData[key];
      this._batchDetails[key] = {
        raw: datum,
        timeDomain: d3.extent(datum, d => new Date(d.toc)),
        discreteDomain: datum.map(d => d.upid),
        oldXRange: [0, 0],
        xRange: [0, 0],
        xScale: null,
        upid: datum.map(d => d.upid),
        width: datum.length * this._mingap
      };
      for(let index in datum){
        let obj = datum[index],
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
    }

    // this._batchName = newBatch;
    this._mergeArray = this._batchName.map(d => this._batchDetails[d].width);

    this.#initSetting();
    this.reflow();
    this.reRender();

    this._container.selectAll(".iconDetails").raise();
    this.updateIcon();
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

    this._currentKeys.forEach(d => {
      let arr = Object.values(this._upidDetails).map(e => e.dimens[d]).filter(d => d !== undefined);
      if(arr.length !== 0){
        LD[d].yScale = d3.scaleLinear().range([0, this._mergeHeight])
        .domain(
          [d3.min([arr.map(d => d.value), arr.map(d => d.extremum_l)].flat()) * 0.95,
            d3.max([arr.map(d => d.value), arr.map(d => d.extremum_u)].flat()) * 1.05])
          // d3.extent([arr.map(d => d.value), arr.map(d => d.extremum_l), arr.map(d => d.extremum_u)].flat()))
      }else{
        LD[d].yScale = null;
      }

      if(this._riverInstances[d] === undefined){
        this._riverInstances[d] = {}
      }
    });

    Object.keys(this._riverInstances).forEach(d => {
      if(this._currentKeys.indexOf(d) === -1){
        // console.log(d)
        delete this._riverInstances[d];
      }
    })
  }

  #getBatchParams(){
    let keys = Object.keys(this._batchDetails);
    let range = Array.from(d3.cumsum(keys.map((_, i) => this._mergeArray[i])));
    range.unshift(0);
    
    let rangeArray = d3.pairs(range);
    rangeArray.forEach((d, i) => {
      let singleData = this._batchDetails[keys[i]];
      singleData.oldXRange = singleData.xRange;
      singleData.xRange = d;
      singleData.width = d[1] - d[0];
      singleData.xScale = this._isDiscrete 
        ? d3.scaleBand().range(d.map(e => e - d[0])).domain(singleData.discreteDomain)
        .paddingInner(0).paddingOuter(0).align(0.5)
        : d3.scaleLinear().range(d.map(e => e - d[0])).domain(singleData.timeDomain);
      singleData.xAccessor = this._isDiscrete ? e => e.upid : e => new Date(e.toc);
      singleData.step = this._isDiscrete ? singleData.xScale.step() : 0;
      })
  }

  render() {
    this._container.selectAll("*").remove();  // 先清空container

    this.#renderGroup();
    this.#renderDefsG();
    this.reflow();
    this.#renderSingleRow();

    // setTimeout(()=>{
    //   this.updateData(["sort1", "sort2", "sort3", "sort4", "sort5", "sort8"]);
    // }, 5000)
    return this;
  }

  reRender(){
    this.reflow();
    this.#renderSingleRow();
    d3.selectAll(".labelGroup").nodes().map(d => this.#joinBatchElement(d3.select(d)));
    // this._currentKeys
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
        this._initMouseEvent({
          "label": d
        })
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
        this._removeMouseEvent({
          label: d
        })
      })
  }

  #joinBatchElement(group, {
    context = this,
    groupAttrs = {
      transform: d => {
        // console.log(d, this._batchDetails[d], this._batchName)
        return translate([this._batchDetails[d].xRange[0] + this._cardMargin.left + this._barWidth, this._cardMargin.top])
      },
      class: function(d){return `label_${getParentData(this, 1)} batch_${d} batchElement`}
    },
    updateGroupFunc = g => updateElement(g, groupAttrs),
    cardAttrs = {
      height: function(){ return context._labelDetails[getParentData(this, 2)].height 
        - context._cardMargin.top - context._cardMargin.bottom},
      class: "renderBox",
      label: function(){return context._labelDetails[getParentData(this, 2)].height},
      width: d => this._batchDetails[d].width,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    }
  } = {}){
    // const key = group.data();
    group.selectAll(`.batchElement`).data(this._batchName, d => d)
    .join(
      enter => enter.append("g")
        .attr("transform", d => translate([this._batchDetails[d].oldXRange[0],  this._cardMargin.top]))
        .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
        .call(tar => createElement(tar, "rect", cardAttrs))
        .each(function(d){
          let {width, height} = this.getBBox();
          console.log(width, height)
          let label = getParentData(this, 1), //getParentData(this, 1), getParentData(this, 0)
            indexDatum = context._labelDetails[label],
            batch = d,
            batchDatum = context._batchDetails[batch],
            lineDatum = batchDatum.upid.map(e => context._upidDetails[e].dimens[label]);
            if(lineDatum.filter(d => d !== undefined).length === 0)return;
        //   // console.log("enter", label, batch)
          context._riverInstances[label][batch] = new riverView({
            width,
            height,
            container: d3.select(this),
            xIndex: batch,
            yIndex: label,
            yScale: indexDatum.yScale,
            xScale: batchDatum.xScale,
            xAccessor: batchDatum.xAccessor,
            yAccessor: e => e.value,
            step: batchDatum.step,
            lineDatum: lineDatum,
            filterFunc: d => d.l > d.value || d.u < d.value, //d.extremum_l > d.value || d.extremum_u < d.value
            filterArr: [d => d.l > d.value &&  d.fqc_label !== 0, d => d.u < d.value && d.fqc_label !== 0],
            pattern: indexDatum.pattern
          }).render();
          // console.log(Object.keys(context._riverInstances), label)
        }),
      update => update.transition().duration(500).ease(d3.easeLinear)
        .call(updateGroupFunc)
        .call(tar => updateElement(tar.selectAll(".renderBox"), cardAttrs))
        .each(function(d){
          let label = getParentData(this, 1),
            indexDatum = context._labelDetails[label],
            batch = d,
            batchDatum = context._batchDetails[batch],
            lineDatum = batchDatum.upid.map(e => context._upidDetails[e].dimens[label]);
            if(lineDatum.filter(d => d !== undefined).length === 0)return;
          // console.log("update", label, batch)//, context._batchDetails)
          context._riverInstances[label] && context._riverInstances[label][batch] && context._riverInstances[label][batch].updateRiver({
            xScale: context._batchDetails[batch].xScale,
            yScale: indexDatum.yScale,
            xAccessor: context._batchDetails[batch].xAccessor,
            step: context._batchDetails[batch].step,
            lineDatum: lineDatum,
            pattern: context._labelDetails[label].pattern
          })
        })
        ,
      exit => exit
        // .transition().duration(500).ease(d3.easeLinear)
        //   .call(updateGroupFunc)
        .remove()
        )
    .on("click", (e, d) => {
      // console.log(d)
      // console.log("click", e, e.target, d3.pointer(e))
    })
    .on("mouseenter", (e, d) => {
      this._initMouseEvent({
        "batch": d
      })
    })
    .on("mouseleave", (e, d) => {
      let target = e.target,
        i = getParentData(target, 1),
        j = d;
      this._removeMouseEvent({
        "batch": d,
      });
      context._riverInstances?.[i]?.[j]?.updateRiver();
    })
    .on("mousemove", (e, d) => {
      let target = e.target,
        i = getParentData(target, 2),
        j = d;
      context._riverInstances?.[i]?.[j]?.mouseX(d3.pointer(e)[0]);
    })
  }

  #joinBarElement(group, {
    groupAttrs = {
      transform: translate([this._cardMargin.left , this._cardMargin.top]),
      class: "barElement"
    },
    options = {
      width: this._barWidth - 10,
    }
  } = {}){
    let context = this;
    this._barInstances = {};
    group
    .append("g")
    .call(g => updateElement(g, groupAttrs))
    .each(function(d){
      let datum = Object.values(context._upidDetails).filter(e => e.dimens[d] !== undefined);
      if(datum.length === 0)return;
        let arr = datum.map(e => e.dimens[d].value),
          data = d3.bin().thresholds(20)(arr),
          container = d3.select(this),
          xDomain = [data[0].x0, data[data.length - 1].x1],
          height = context._labelDetails[d].height - context._cardMargin.top - context._cardMargin.bottom,
          bad = d3.bin().thresholds(10)(datum.filter(e => e.fqc_label === 0).map(e => e.dimens[d].value)),
          good = d3.bin().thresholds(10)(datum.filter(e => e.fqc_label === 1).map(e => e.dimens[d].value));
        d3.select(this).call(g => updateElement(g, groupAttrs));
      context._barInstances[d] = new barView(Object.assign({
          container: container,
          data: [bad, good],
          status: d3.max(good, d => d.length) > d3.max(bad, d => d.length),//data number Boolen
          xDomain,
          height,
          color: mergeColor,
          opacity: [0.5, 0.8]
        }, options)).render()
      })
    // console.log(this._barInstances)
  }

  _initMouseEvent(options = {
  }){
    if(options["label"] !== undefined){
      this._container.selectAll(".labelGroup")
        .attr("opacity", f => options["label"] !== f ? 0.6 : 1);
    }
    if(options["batch"] !== undefined){
      this._container.selectAll(".batchElement")
        .attr("opacity", f => options["batch"] !== f ? 0.6 : 1);
    }
  }

  _removeMouseEvent(options = {
  }){
    if(options["label"] !== undefined){
      d3.selectAll(".labelGroup")
        .attr("opacity", 1);
    }
    if(options["batch"] !== undefined){
      d3.selectAll(".batchElement")
        .attr("opacity", 1);
    }
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
      this._labelDetails[d].pattern = this._labelDetails[d].pattern === "river" ? "temporal" : "river";
      this.#joinBatchElement(d3.selectAll(".labelGroup").filter(e => e === d))
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
  
  updateIcon(){
    d3.selectAll(".iconDetails")
      .transition().duration(500).ease(d3.easeLinear)
      .attr("transform",  translate(this._cardWidth - 20, 0))
  }
}