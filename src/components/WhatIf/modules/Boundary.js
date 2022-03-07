import * as d3 from 'd3';

export class Boundary {
  static judge(direction) {
    if (!(direction === 'left' || direction === 'right')) {
      console.warn('边界方向选定只能是left或者right');
      return false;
    }
    return true;
  }

  static brush({
    width = 3,
    height = 15,
    direction = 'right', // left | right
  } = {}) {
    if (!this.judge(direction)) return '';
  
    let wStep = width / 3,
        hCenter = height / 2;
    let triOffset = 2 * wStep / 0.866 / 2; // h_center / cos(30°) / 2 三角形底边一半
  
    let point = [
      [0, 0],
      [wStep, 0],
      [wStep, hCenter - triOffset],
      [width, hCenter],
      [wStep, hCenter + triOffset],
      [wStep, height],
      [0, height]
    ];
    if (direction === 'left') {
      point = point.map(d => [-d[0], d[1]]);
    }
    
    return `M${point.join("L")}Z`;
  }

  static batch({
    width = 3,
    height = 15,
  } = {}) {
    let wCenter = width / 2;
    let triHeight = width * 0.866;  // w * cos(30°)
    let barWidth = width / 10;
  
    let point = [
      [0, -triHeight],
      [wCenter, -triHeight],
      [barWidth / 2, 0],
      [barWidth / 2, height - triHeight],
      [-barWidth / 2, height - triHeight],
      [-barWidth / 2, 0],
      [-wCenter, -triHeight],
      [0, -triHeight]
    ];
    
    return `M${point.join("L")}Z`;
  }
}
