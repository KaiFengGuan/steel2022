import * as d3 from 'd3-selection';
export function createElement(g, tag, attrs){
  let element = g.append(tag);
  return updateElement(element, attrs);
}
//data enter - update - exit
//https://observablehq.com/@cengchengcc/bindelement
export function bindElement(tag, initAttrs, t, enterAttrs, updateAttrs, exitAttrs, removeAttrs){
  return [enter => createElement(enter, tag, initAttrs)
      .call(g => updateElement(g.transition(t), enterAttrs)),
    update => updateElement(update, updateAttrs)
      .call(g => updateElement(g.transition(t), {...initAttrs, ...enterAttrs})),
    exit => updateElement(exit, exitAttrs)
      .call(g => updateElement(g.transition(t), removeAttrs).remove())]
}

export function updateElement(element, attrs){
  for(let item in attrs){
    if(item == 'text'){
      element.text(attrs[item])
    }else if(item == 'datum'){
      element.datum(attrs[item])
    }else{
      element.attr(item, attrs[item])
    }
  }
  return element;
}

export function updateStyles(element, styles){
  for(let item in styles){
      element.style(item, styles[item])
  }
  return element;
}

export function updateAsyncElement(element, attrs){
  for(let item in attrs){
    if(attrs[item] instanceof Function){
      if(item == 'text'){
        element.text(attrs[item])
      }else{
        element.attr(item, attrs[item])
      }
    }
  }
  return element;
}
export function attrTween(selection, attr, fn, endfunc){
  selection.
    attrTween(attr, fn)
    .on('end', endfunc)
  return selection;
}

/**
 * mode -> true max -> min
 * mode -> false min -> max
 * [0.06920063103322494, 0.19436112650041948, 0.6520178944851003, 0.4375501755421416, 0.24848507785134522]
 * @param {Array} value 
 * @param {Boolean} mode 
 * @returns [ 4, 3, 0, 1, 2 ]//true	
 * [ 0, 1, 4, 3, 2 ]//false
 */
export function sortedIndex(value, mode){
  let arr = value.map((d, i) => [d, i]);
  arr.sort((a, b) => mode ? b[0] - a[0] : a[0] - b[0]);
  let res = new Array(value.length).fill(0);
  arr.forEach((d, i) => {res[d[1]] = i});
  return res;
}

export function getParentData(context, generation = 0){
  while(generation !== 0){
    context = context.parentNode;
    generation --;
  }
  if(generation === 0){
    return d3.select(context).data()[0];
  }
  return d3.select(context).data()[0]
}

export const updateChildrenNodes = (context, selection, func) => {
  selection.nodes().map(d => func.call(context, d3.select(d)))
}

export const translate = (arr) => `translate(${arr})`

export const queryIcon = ['M828.4 805.4L671.5 648.5c-46.8 48.5-112.3 78.3-184.9 79.3-146.8 2-268.5-118.2-268.2-265 0.3-146 118.3-263.8 264.4-263.8 146.3 0 264.4 118.1 264.4 264.4 0 48.3-13.2 93.7-35.7 133.4-3.8 6.8-2.6 15.2 2.9 20.7 8 8 21.4 6.3 27.2-3.5 26-43.8 40.8-95.2 40.8-150.6 0-165.7-134-299.7-299.7-299.7-165.8 0-299.7 133.9-299.7 299.7 0 165.7 134 299.7 299.7 299.7 70.5 0 135.7-24.7 186.9-65.2L802.9 831c7.2 7.2 19 7 26-0.4 6.6-7.2 6.4-18.3-0.5-25.2z m12.4 12.4', 'M313.1 441c10.2-82.6 76.4-147.4 159-154.9 9.1-0.8 16-8.4 16-17.6 0-10.4-8.9-18.5-19.2-17.6-99.1 9-178.6 86.8-190.8 185.6-1.3 10.5 6.9 19.8 17.5 19.8 8.9 0.1 16.5-6.5 17.5-15.3z m-1.2 15.4']

export const pinIcon = "M31.997334 1023.957337a31.698692 31.698692 0 0 1-22.611449-9.385885c-6.058162-6.015499-9.385885-14.078827-9.385885-22.611449s3.327723-16.59595 9.385885-22.611449l318.864094-318.864094-152.520623-152.520624a95.906674 95.906674 0 0 1-25.08591-92.15232A95.309391 95.309391 0 0 1 194.970419 347.192401l0.895925-0.511958A353.463878 353.463878 0 0 1 372.022331 299.281727c20.136989 0 40.359303 1.749188 60.282977 5.204899l165.404883-259.946338A95.224065 95.224065 0 0 1 678.684776 0.085326c25.64053 0 49.745188 9.983168 67.877011 28.072328l249.195233 249.195233a95.224065 95.224065 0 0 1 25.896509 88.739272 95.138738 95.138738 0 0 1-42.151154 60.154987l-259.989001 165.447546a352.226648 352.226648 0 0 1-42.663112 237.292226 95.394717 95.394717 0 0 1-82.851762 47.526706 95.522706 95.522706 0 0 1-67.962336-28.200317l-152.60595-152.605949-318.821431 318.906757a31.912007 31.912007 0 0 1-22.611449 9.343222zM372.022331 363.276394c-50.641113 0-100.684943 13.566869-144.7986 39.207399a31.570702 31.570702 0 0 0-14.67611 19.497042 31.698692 31.698692 0 0 0 8.36197 30.674777l350.434797 350.434797c6.058162 6.058162 14.12149 9.385885 22.696775 9.385885a31.698692 31.698692 0 0 0 27.56037-15.785352 287.421382 287.421382 0 0 0 31.058745-212.67561 31.997334 31.997334 0 0 1 13.908175-34.471794l278.590117-177.265228a31.570702 31.570702 0 0 0 14.036164-20.051662 31.698692 31.698692 0 0 0-8.617949-29.565536L701.296225 73.380552a31.912007 31.912007 0 0 0-49.617198 5.418215l-177.307891 278.590117a31.826681 31.826681 0 0 1-34.471794 13.908175 293.778185 293.778185 0 0 0-67.877011-8.020665z"

export const zoomIcon = "M448 554.666667 149.333333 554.666667c-12.8 0-21.333333 8.533333-21.333333 21.333333 0 12.8 8.533333 21.333333 21.333333 21.333333l247.466667 0L49.066667 945.066667C44.8 949.333333 42.666667 953.6 42.666667 960c0 12.8 8.533333 21.333333 21.333333 21.333333 6.4 0 10.666667-2.133333 14.933333-6.4L426.666667 627.2 426.666667 874.666667c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-8.533333 21.333333-21.333333L469.333333 576C469.333333 563.2 460.8 554.666667 448 554.666667zM981.333333 64c0-12.8-8.533333-21.333333-21.333333-21.333333-6.4 0-10.666667 2.133333-14.933333 6.4L597.333333 396.8 597.333333 149.333333c0-12.8-8.533333-21.333333-21.333333-21.333333s-21.333333 8.533333-21.333333 21.333333l0 298.666667c0 12.8 8.533333 21.333333 21.333333 21.333333l298.666667 0c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333333L627.2 426.666667 974.933333 78.933333C979.2 74.666667 981.333333 70.4 981.333333 64z"

export function arrowData(data){
  // // const multiIndex = [];
  // // for(let i = 0; i < data.length; i++){
  // //   if(data[i].dia_Status && data[i].flag == 0){
  // //     multiIndex.push(i);
  // //   }
  // // }
  // const singleIndex = [];
  // for(let i = 0; i < data.length; i++){
  //   if(data[i].ovrage){
  //     singleIndex.push(i);
  //   }
  // }
  // const intersection = singleIndex;
  // var obj = {};
  // //   single: [...d3.difference(singleIndex, intersection)],
  // //   multivariate: [...d3.difference(multiIndex, intersection)] 
  // if(intersection.length !== 0){
  //   let res = [[intersection[0]]];
  //   for(let item = 1; item < intersection.length; item++){
  //     let last = res[res.length - 1];
  //     if(last[last.length - 1] === intersection[item] - 1 && data[last[last.length - 1]].range === data[intersection[item]].range){
  //       last.push(intersection[item])
  //     }else{
  //       res.push([intersection[item]])
  //     }
  //   }
  //   obj.intersection = res.filter(d => d.length !== 1);
  // }else{
  //   obj.intersection = [];
  // }
  // const single = [...d3.difference(singleIndex, obj.intersection.flat())];
  // // const multivariate = [...d3.difference(multiIndex, obj.intersection.flat())];
  
  // obj.single = single.map(d => data[d]);
  // // obj.multivariate = multiIndex.map(d => data[d]);
  // obj.intersection = obj.intersection.map(d => d.map(e => data[e]));
  // // if(obj.intersection.length !== 0)console.log(obj.intersection)
  // return obj;
}

export function getRandomID(length = 5){  //随机数 + 时间戳 生成唯一ID
  return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
}

export function getClosestDatum(arr, x){
  if(x <= arr[0]){
    return 0
  }else if(x >= arr[arr.length - 1]){
    return arr.length - 1;
  }
  let index = 0;
  while(x >= arr[index + 1]){
    index ++;
  }
  return index + ((arr[index] + arr[index + 1])/2 <= x ? 1 : 0)
}