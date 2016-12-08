/*var grid = [
  [1,2,3],
  [4,5,6],
  [7,8,9]
];

rotate(grid);

*/

function updateGeometry(geometry){
  geometry.computeVertexNormals();
  geometry.computeFaceNormals();
  geometry.normalsNeedUpdate = true;
  geometry.elementsNeedUpdate = true;
  geometry.colorsNeedUpdate = true;
}

function Spherify(geometry, radius){
  for (var i in geometry.vertices) {
      var vertex = geometry.vertices[i];
      vertex.normalize().multiplyScalar(radius);
  }
}


function rotate(array2d){
  var newGrid = [];
  newGrid.length = array2d.length;
  rowLength = array2d[0].length;

  for(var i=0; i < array2d.length; i++){
    newGrid[i] = [];
  }

  for(var i=0; i< array2d.length; i++){
    for(var j=0; j< array2d.length; j++){
      var newJ = rowLength - i - 1;
      var newI = j;
      newGrid[newI][newJ] = array2d[i][j];
    }
  }

  for (var i = 0; i < newGrid.length; i++)
  {
    //console.log(newGrid[i])
  }
  return newGrid
}

function getMax(array) {
    var max = -Infinity;
    for (var i = 0; i < array.length; i++) {
        var m = Math.max.apply(null, array[i]);
        if (m > max) {
            max = m;
        }
    }
    return max;
}

function getMin(array) {
    var min = Infinity;
    for (var i = 0; i < array.length; i++) {
        var m = Math.min.apply(null, array[i]);
        if (m < min) {
            min = m;
        }
    }
    return min;
}
