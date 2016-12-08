var n = n;
var roughness = roughness;
var smoothness = smoothness;
var scale = scale;
var cliff = cliff;
var lacunarity = lacunarity;

var QTGPU = QTGPU;
var GNORMALS = GNORMALS;


var C = 10; //view distance constant: higher means more detail but more computational cost.
var Persistentlevels =2; // number of quadTree levels to be displayed regardless of distance.
var maxLevels = 10; //maximum quadTree depth
var chunkSide =16; //chunk dimesion: number of triangles per chunk = (chunkside^2)*2

var QuadSphere = function(radius, material, scene){
  this.trees = [];
  this.meshes = {};
  this.rMeshes= [];
  this.radius = radius;
  this.scene = scene;
  this.material = material;
  for(var i = 0; i < 6; i++){
    this.trees[i] = new QuadTree(i,1, this);
  }
}


QuadSphere.prototype = {
  addMesh: function(mesh, name){
    this.meshes[name] = mesh;
  },

  init: function(maxLevel){
    for (var i=0; i< 6; i++){
      this.trees[i].root.init(maxLevel);
    }
  },

  draw: function(camera){
    var dir = getCameraDirection(camera);
    for (var i=0; i< 6; i++){
      this.trees[i].root.draw(camera.position, dir);
    }

    //console.log(this.rMeshes);
    for(var key in this.meshes){
      this.scene.add(this.meshes[key]);
    }


    for(var i in this.rMeshes){
      this.meshes[this.rMeshes[i]].geometry.dispose();
      this.scene.remove(this.meshes[this.rMeshes[i]]);
      delete this.meshes[this.rMeshes[i]];
    }
    this.rMeshes = [];

  }
}



var Node = function(parent, position, level, tree){
  this.name = position.x + ":" + position.y + ":" + tree.index;
  this.parent = parent;
  this.position = position; // x,y
  this.level = level;
  this.tree = tree;
  if(!this.parent){
    this.hsl = 0.5;
  } else{
    this.hsl = Math.abs(this.parent.position.x-position.x); // half side the lenght of the triangle to draw
  }

  this.sPosition = findSpherePosition(position.x, position.y, tree.width, tree.index, tree.sphere.radius);
  perturbVector(this.sPosition , smoothness, roughness, scale, cliff, lacunarity);
  //console.log(this.sPosition);

}

Node.prototype = {
  birth: function(){
    var hsl = this.hsl
    var children = [];
    var x = this.position.x;
    var y = this.position.y;
    children[0] = new Node(this, new THREE.Vector2(x -hsl/2, y -hsl/2), this.level+1, this.tree);
    children[1] = new Node(this, new THREE.Vector2(x +hsl/2, y -hsl/2), this.level+1, this.tree);
    children[2] = new Node(this, new THREE.Vector2(x +hsl/2, y +hsl/2), this.level+1, this.tree);
    children[3] = new Node(this, new THREE.Vector2(x -hsl/2, y +hsl/2), this.level+1, this.tree);
    this.children = children;
  },

  isLeaf: function(cPosition, cDirection){
    var wp = (new THREE.Vector3().copy(this.sPosition)).applyMatrix4( this.tree.sphere.scene.matrixWorld );
    var dist = (new THREE.Vector3(cPosition.x, cPosition.y, cPosition.z)).sub(wp);
    //var viewComponent = cDirection.dot((new THREE.Vector3()).copy(dist).normalize());
    var l = dist.length();
    //viewComponent < 0.1? l = C+1:0;
    //console.log(this.level);
    if(( C*this.tree.sphere.radius/Math.pow(2,this.level) > l || this.level < Persistentlevels) && this.level < maxLevels ){
      return false;
    }
      return true;

  },

  init: function(maxLevel){
    if(this.level < maxLevel){
      this.getGeo();
      if(!this.children){ this.birth(); } // bottomLeft, bottomright, topRight, topLeft
      for(i in this.children){ this.children[i].init(maxLevel); }
    }
  },

  draw: function(cPosition, cDirection){
    if(!this.isLeaf(cPosition, cDirection)){
         if(this.isDrawn){this.unDraw();}
         if(!this.children){ this.birth(); } // bottomLeft, bottomright, topRight, topLeft
         for(i in this.children){ this.children[i].draw(cPosition,cDirection); }
     } else if(!this.isDrawn) {
         //console.log('hi');
         var geo = this.getGeo();
         var mesh = new THREE.Mesh(geo, this.tree.sphere.material);
         this.tree.sphere.addMesh(mesh, this.name);
         this.isDrawn = true;
         if(this.children){
           for(i in this.children){this.children[i].unDrawCascade();}
           //this.children = undefined;
         }
     }


  },

  unDrawCascade: function(){
    if(this.children != undefined){
      for(i in this.children){this.children[i].unDrawCascade();}
      //this.children = undefined;
    }
    if(this.isDrawn){
      this.unDraw();
      this.isDrawn = false;
    }
  },

  unDraw: function(){
      //console.log('undraw');
      this.tree.sphere.rMeshes.push(this.name);
      this.isDrawn = false;
  },

  getGeo: function(){
    if(this.geo){ return this.geo;}

    var hsl = this.hsl;
    var skirtDim = (2*hsl/chunkSide)*1
    var sideDim = 2*hsl+ skirtDim;

    var geo = new THREE.PlaneBufferGeometry( sideDim, sideDim, chunkSide+1, chunkSide+1);
    var positions = geo.attributes.position.array;
    var normals = geo.attributes.normal.array;
    //console.log(positions);
    for (var i =0; i < positions.length; i+=3) {
        var x = positions[i];
        var y = positions[i+1];
        var coord = findSpherePosition(x+ this.position.x ,y+ this.position.y, this.tree.width, this.tree.index, this.tree.sphere.radius);
        var normal=null;
        if(!QTGPU && GNORMALS) normal = getNormal( coord, smoothness, scale, this.tree.sphere.radius, roughness);

        if(!QTGPU)perturbVector(coord, smoothness, roughness, scale, cliff, lacunarity);
        positions[i] = coord.x;
        positions[i+1] = coord.y;
        positions[i+2]=coord.z

        if(!QTGPU && GNORMALS){
          normals[i] =normal.x;
          normals[i+1]= normal.y;
          normals[i+2] = normal.z;
        }


    }
    if(!QTGPU && !GNORMALS)geo.computeVertexNormals();
    this.geo = geo;
    return geo;
  }

}


var QuadTree = function(index, width, sphere){
  this.sphere = sphere;
  this.index = index;
  this.width = width;
  this.root = new Node(null, new THREE.Vector2(0.5,0.5), 0, this);
}

function getCameraDirection(camera){
  var dir = camera.getWorldDirection().multiplyScalar(-1);
  //console.log(dir);
  return dir;
}

function addTriangle(positions, normals, v1, v2, v3, index, radius){
  addVertex(positions, v1, index);
  addVertex(positions, v2, index+3);
  addVertex(positions, v3, index+6);

  var n1 = getNormal(v1,resolution, smoothness, roughness, scale, cliff, radius);
  var n2 = getNormal(v2,resolution, smoothness, roughness, scale, cliff, radius);
  var n3 = getNormal(v3,resolution, smoothness, roughness, scale, cliff, radius);

  addVertex(normals, n1, index);
  addVertex(normals, n2, index+3);
  addVertex(normals, n3, index+6);
}

function addVertex(positions, v, index){
  positions[index] = v.x;
  positions[index+1] = v.y;
  positions[index+2] = v.z;
}

function findSpherePosition(x,y, width, index, radius){
  var width = width/2;
  var x = x-width;
  var y =y-width;
  var coord = new THREE.Vector3(0,0,0);
  if (index == 0) {coord.x=-width; coord.y=-y; coord.z=-x;}
  else if (index == 1) {coord.x=width; coord.y=-y; coord.z=x;}
  else if (index == 2) {coord.x=x; coord.y=-width; coord.z=y;}
  else if (index == 3) {coord.x=x; coord.y=width; coord.z=-y;}
  else if (index == 4) {coord.x=x; coord.y=-y; coord.z=-width;}
  else if (index == 5) {coord.x=-x; coord.y=-y; coord.z=width;}

  coord.normalize().multiplyScalar(radius);

  return coord;
}
