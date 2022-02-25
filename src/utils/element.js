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