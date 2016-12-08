//TestPlanet();


function TestPlanet(){
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(1, window.innerWidth/window.innerHeight, 1, 5000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var n = 6;
var radius = 20;
var raughness = 3;
var dim = Math.pow(2,n)+1;
var geometry = new THREE.BoxGeometry(5, 5, 5, dim-1, dim-1, dim-1);
for (var i in geometry.vertices) {
    var vertex = geometry.vertices[i];
    vertex.normalize().multiplyScalar(radius);
}
scene.add( new THREE.AmbientLight( 0xffffff ) );
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 10000, 10000, 10000 );
//scene.add( directionalLight );

var terrains = CubeTerrain(n, raughness);
modelSphere(geometry, terrains, raughness, [4,5,1,0,2,3]);
var controls = new THREE.OrbitControls(camera, renderer.domElement);

var material = new THREE.MeshLambertMaterial({color: 0xfffff, wireframe: true});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 1000;

function render() {
   requestAnimationFrame(render);
   //cube.rotation.x += 0.01;
   //cube.rotation.y += 0.01;
   renderer.render(scene, camera);
};

render();
}



function InizializeTerrain(n) {
    var dim = Math.pow(2, n) + 1;
    var terrain = [];
    for (var i = 0; i < dim; i++) {
        terrain[i] = [];
        for (var j = 0; j < dim; j++) {
            terrain[i][j] = 0;
        }
    }
    terrain[0][0] = 0;
    terrain[dim - 1][dim - 1] = 0;
    terrain[dim - 1][0] = 0;
    terrain[0][dim - 1] = 0;
    console.log("Inizialization completed");
    return terrain;
}

function DiamondSquare(n, terrain, roughness, topT, bottomT, leftT, rightT) {
    var dim = Math.pow(2, n) + 1;
    if(topT != null){
      for(var i = 0; i < dim; i++){
        terrain[0][i] = topT[dim-1][i];
      }
    }
    if(bottomT != null){
      for(var i = 0; i < dim; i++){
        terrain[dim-1][i] = bottomT[0][i];
      }
    }
    if(leftT != null){
      for(var i = 0; i < dim; i++){
        terrain[i][0] = leftT[i][dim-1];
      }
    }
    if(rightT != null){
      for(var i = 0; i < dim; i++){
        terrain[i][dim-1] = rightT[i][0];
      }
    }



    var numsquares = 1;
    for (var i = Math.pow(2, n); i > 1; i /= 2) {
        console.log("start steps with pace: " + i);
        //Diamond Step
        for (var j = 0; j < numsquares; j++) {
            for (var k = 0; k < numsquares; k++) {
                terrain[(i / 2) + j * i][(i / 2) + k * i] = (terrain[i * j][i * k] + terrain[i * (j + 1)][i * k] + terrain[i * j][i * (k + 1)] + terrain[i * (j + 1)][i * (k + 1)]) / 4 + rand(i * roughness);
            }
        }
        console.log("end of Diamond Step");
        //Square Step part 1
        for (var j = 0; j < numsquares + 1; j++) {
            for (var k = 0; k < numsquares; k++) {
                var r = j * i;
                var c = i / 2 + k * i;
                if (r == 0) {
                    if(topT == null){
                      terrain[r][c] = (terrain[r][c - i / 2] + terrain[r + i / 2][c] + terrain[r][c + i / 2]) / 3 + rand(i * roughness);
                    }
                }
                else if (r == Math.pow(2, n)) {
                    if(bottomT == null){
                      terrain[r][c] = (terrain[r - i / 2][c] + terrain[r][c - i / 2] + terrain[r][c + i / 2]) / 3 + rand(i * roughness);
                    }
                }
                else {
                    terrain[r][c] = (terrain[r - i / 2][c] + terrain[r][c - i / 2] + terrain[r + i / 2][c] + terrain[r][c + i / 2]) / 4 + rand(i * roughness);
                }
            }
        }
        console.log("end of Square Step");
        //Square Step part 2
        for (var j = 0; j < numsquares; j++) {
            for (var k = 0; k < numsquares + 1; k++) {
                var r = i / 2 + j * i;
                var c = k * i;
                if (c == 0) {
                    if(leftT == null){
                      terrain[r][c] = (terrain[r - i / 2][c] + terrain[r + i / 2][c] + terrain[r][c + i / 2]) / 3 + rand(i * roughness);
                    }
                }
                else if (c == Math.pow(2, n)) {
                    if(rightT == null){
                      terrain[r][c] = (terrain[r - i / 2][c] + terrain[r][c - i / 2] + terrain[r + i / 2][c]) / 3 + rand(i * roughness);
                    }
                }
                else {
                    terrain[r][c] = (terrain[r - i / 2][c] + terrain[r][c - i / 2] + terrain[r + i / 2][c] + terrain[r][c + i / 2]) / 4 + rand(i * roughness);
                }
            }
        }
        numsquares *= 2;
    }
    /*
    //DEBUG
    console.log(" ");
    console.log("Table completed, results: ");
    for (var i = 0; i < dim; i++) {
        var row = "";
        for (var z = 0; z < dim; z++) {
            row += Math.round(terrain[i][z] * 100) / 100 + " ";
        }
        console.log(row);
    }
    */

}

function modelSphere(sphere, terrains, roughness, order){
  //var order = [4,5,1,0,2,3];
  var order =order || [0,1,3,2,4,5];
  var dim = terrains[0].length
  var index = 0;

  //right
  for (var i = 0; i < dim; i++) {
      for (var j = 0; j < dim; j++) {
          var v = sphere.vertices[index];
          var w = (new THREE.Vector3()).copy(v);
          v.add(w.normalize().multiplyScalar(terrains[order[0]][i][j]*roughness));
          index++;

      }
  }

  //left
  for (var i = 0; i < dim; i++) {
      for (var j = 0; j < dim; j++) {
        var v = sphere.vertices[index];
        var w = (new THREE.Vector3()).copy(v);
        v.add(w.normalize().multiplyScalar(terrains[order[1]][i][j]*roughness));
        index++;
      }
  }

  //up
  for (var i = 0; i < dim; i++) {
      for (var j = 1; j < dim-1; j++) {
        var v = sphere.vertices[index];
        var w = (new THREE.Vector3()).copy(v);
        v.add(w.normalize().multiplyScalar(terrains[order[2]][i][j]*roughness));
        index++;
      }
  }

  //down
  for (var i = 0; i < dim; i++) {
      for (var j = 1; j < dim-1; j++) {
        var v = sphere.vertices[index];
        var w = (new THREE.Vector3()).copy(v);
        v.add(w.normalize().multiplyScalar(terrains[order[3]][i][j]*roughness));
        index++;
      }
  }

  //forward
  for (var i = 1; i < dim-1; i++) {
      for (var j = 1; j < dim-1; j++) {
        var v = sphere.vertices[index];
        var w = (new THREE.Vector3()).copy(v);
        v.add(w.normalize().multiplyScalar(terrains[order[4]][i][j]*roughness));
        index++;
      }
  }

  //backward
  for (var i = 1; i < dim-1; i++) {
      for (var j = 1; j < dim-1; j++) {
        var v = sphere.vertices[index];
        var w = (new THREE.Vector3()).copy(v);
        v.add(w.normalize().multiplyScalar(terrains[order[5]][i][j]*roughness));
        index++;
      }
  }
}

function CubeTerrain(n,roughness){
  //init sides
  var dim = Math.pow(2, n) + 1;
  var terrains = [];
  for (var k = 0; k< 6; k++){
    terrains[k]=[];
    for (var i = 0; i < dim; i++) {
        terrains[k][i] = [];
        for (var j = 0; j < dim; j++) {
            terrains[k][i][j] = 0;
        }
    }
    terrains[k][0][0] = rand(20);
    terrains[k][dim - 1][dim - 1] = rand(20);
    terrains[k][dim - 1][0] = rand(20);
    terrains[k][0][dim - 1] = rand(20);
  }

  //down
  DiamondSquare(n, terrains[0], roughness)
  //up
  DiamondSquare(n, terrains[1], roughness)
  //forward
  DiamondSquare(n, terrains[2], roughness, terrains[1], terrains[0], null, null)
  //backward
  DiamondSquare(n, terrains[3], roughness, rotate(rotate(terrains[1])), rotate(rotate(terrains[0])), null, null)
  //right
  DiamondSquare(n, terrains[4], roughness, rotate(terrains[1]), rotate(rotate(rotate(terrains[0]))), terrains[2], terrains[3])
  //left
  DiamondSquare(n, terrains[5], roughness, rotate(rotate(rotate(terrains[1]))), rotate(terrains[0]), terrains[3], terrains[2])

  normalize(terrains);


 return terrains;
}
function normalize(terrains){
  var dim = terrains[0].length;
  var range = - Infinity;
  for(var k = 0; k< terrains.length; k++){
    var max = Math.abs(getMax(terrains[k]));
    var min = Math.abs(getMin(terrains[k]));
    var r = max > min ? max : min;
    if (r > range){ range = r}
  }
  for(var k = 0; k< terrains.length; k++){
    for (var i = 0; i < dim; i++) {
        for (var j = 0; j < dim; j++) {
            terrains[k][i][j] /=range;
        }
    }
  }

}

function rand(step) {
    return (Math.random() - 0.5) * step;
}
