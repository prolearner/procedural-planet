var intFunction = tricosine; // simplex || tricosine
var noiseFunction = RidgedNoise; // RidgedNoise || PerlinNoise
var nOctaves = 16; // number of noise levels


var seed = 1;
var amp = null;


function setSeed(newSeed){seed = newSeed;}
function setAmp(a){amp = a;};

function pseudoRandom(coord){
  var s = Math.sin((new THREE.Vector3(12.9898,78.233,1.23456)).dot(coord)) * (5356.5453+seed*1234.876);
  return s - Math.floor(s);
}

function random4( x, y, z) {
  return pseudoRandom(new THREE.Vector3(x, y, z), seed);
}

function interpolation( a, b, x) {
  var ft = x * 3.1415927;
  var f = (1.0 - Math.cos(ft)) * 0.5;
  return a*(1.0-f) + b*f;
}

function tricosine(coord) {
  var coord0 = new THREE.Vector3(Math.floor(coord.x), Math.floor(coord.y), Math.floor(coord.z));
  var coord1 = new THREE.Vector3(coord0.x+1.0, coord0.y+1.0, coord0.z+1.0);
  var xd = (coord.x - coord0.x)/Math.max(1.0, (coord1.x-coord0.x));
  var yd = (coord.y - coord0.y)/Math.max(1.0, (coord1.y-coord0.y));
  var zd = (coord.z - coord0.z)/Math.max(1.0, (coord1.z-coord0.z));
  var c00 = interpolation(random4(coord0.x, coord0.y, coord0.z), random4(coord1.x, coord0.y, coord0.z), xd);
  var c10 = interpolation(random4(coord0.x, coord1.y, coord0.z), random4(coord1.x, coord1.y, coord0.z), xd);
  var c01 = interpolation(random4(coord0.x, coord0.y, coord1.z), random4(coord1.x, coord0.y, coord1.z), xd);
  var c11 = interpolation(random4(coord0.x, coord1.y, coord1.z), random4(coord1.x, coord1.y, coord1.z), xd);
  var c0 = interpolation(c00, c10, yd);
  var c1 = interpolation(c01, c11, yd);
  var c = interpolation(c0, c1, zd);
  return c;
}

function simplex(coord){
  var n0, n1, n2, n3; // Noise contributions from the four corners
  //Skewing Coords
  var s = (coord.x + coord.y + coord.z)*(1.0/3.0);
  var xs = Math.floor(coord.x+s);
  var ys = Math.floor(coord.y+s);
  var zs = Math.floor(coord.z+s);

  //Unskewing and distance vectors from the unskewed cell
  var G3= (1.0/6.0);
  var t = (xs+ ys + zs)*G3;
  var X0 = xs -t;
  var Y0 = ys -t;
  var Z0 = zs -t;
  var u = (coord.x + coord.y + coord.z)*G3;
  var dx0 = coord.x - X0;
  var dy0 = coord.y - Y0;
  var dz0 = coord.z - Z0;

  //Determinate the simplex of the coord
  var off2 = new THREE.Vector3();
  var off3 = new THREE.Vector3();
  if(dx0 >= dy0) {
        if(dy0 >= dz0)      { off2.x=1; off2.y=0; off2.z=0; off3.x=1; off3.y=1; off3.z=0; }
        else if(dx0 >= dz0) { off2.x=1; off2.y=0; off2.z=0; off3.x=1; off3.y=0; off3.z=1; }
        else              { off2.x=0; off2.y=0; off2.z=1; off3.x=1; off3.y=0; off3.z=1; }
    } else {
        if(dy0 < dz0)      { off2.x=0; off2.y=0; off2.z=1; off3.x=0; off3.y=1; off3.z=1; }
        else if(dx0 < dz0) { off2.x=0; off2.y=1; off2.z=0; off3.x=0; off3.y=1; off3.z=1; }
        else             { off2.x=0; off2.y=1; off2.z=0; off3.x=1; off3.y=1; off3.z=0; }
  }

  var dx1 = dx0 - off2.x + G3; // Distances for second corner
  var dy1 = dy0 - off2.y + G3;
  var dz1 = dz0 - off2.z + G3;

  var dx2 = dx0 - off3.x + 2 * G3; // Distances for third corner
  var dy2 = dy0 - off3.y + 2 * G3;
  var dz2 = dz0 - off3.z + 2 * G3;

  var dx3 = dx0 - 1 + 3 * G3; // Distances for fourth corner
  var dy3 = dy0 - 1 + 3 * G3;
  var dz3 = dz0 - 1 + 3 * G3;

  var t0 = 0.5 - dx0*dx0 - dy0*dy0 - dz0*dz0;
  n0 = (t0 < 0) ? 0 : t0 * t0 * random4(X0 , Y0, Z0);

  var t1 = 0.5 - dx1*dx1 - dy1*dy1 - dz1*dz1;
  n1 = (t1 < 0) ? 0 : t1 * t1 * random4(X0+ off2.x -G3, Y0 + off2.y -G3, Z0 + off2.z -G3);

  var t2 = 0.5 - dx2*dx2 - dy2*dy2 - dz2*dz2;
  n2 = (t2 < 0) ? 0 : t2 * t2 * random4(X0+ off3.x -2*G3, Y0 + off3.y -2*G3, Z0 + off3.z -2*G3);

  var t3 = 0.5 - dx3*dx3 - dy3*dy3 - dz3*dz3;
  n3 = (t3 < 0) ? 0 : t3 * t3 * random4(X0+ 1 -3*G3, Y0 + 1 -3*G3, Z0 + 1 -3*G3);

  var noise = 6.3*(n0 + n1 + n2 + n3);
  //if(noise < 0 || noise > 1)console.log(noise); //DEBUG
  return noise;
}

function simplexGradient(coord){
  var g0, g1, g2, g3; // Noise Gradient contributions from the four corners
  //Skewing Coords
  var s = (coord.x + coord.y + coord.z)*(1.0/3.0);
  var xs = Math.floor(coord.x+s);
  var ys = Math.floor(coord.y+s);
  var zs = Math.floor(coord.z+s);

  //Unskewing and distance vectors from the unskewed cell
  var G3= (1.0/6.0);
  var t = (xs+ ys + zs)*G3;
  var X0 = xs -t;
  var Y0 = ys -t;
  var Z0 = zs -t;
  var u = (coord.x + coord.y + coord.z)*G3;
  var dx0 = coord.x - X0;
  var dy0 = coord.y - Y0;
  var dz0 = coord.z - Z0;

  //Determinate the simplex of the coord
  var off2 = new THREE.Vector3();
  var off3 = new THREE.Vector3();
  off2.x = (dx0 >= dy0) ? ((dy0 >= dz0) ? 1 : (dx0 >= dz0) ? 1 : 0) : 0;
  off2.y = (dx0 >= dy0) ? 0 : ((dy0 < dz0) ? 0 : 1);
  off2.z = (dx0 >= dy0) ? ((dy0 >= dz0) ? 0 : (dx0 >= dz0) ? 0 : 1) : ((dy0 < dz0) ? 1 : 0);
  off3.x = (dx0 >= dy0) ? 1 : ((dy0 < dz0) ? 0 : (dx0 < dz0) ? 0 : 1);
  off3.y = (dx0 >= dy0) ? ((dy0 >= dz0) ? 1 : 0) : 1;
  off3.z = (dx0 >= dy0) ? ((dy0 >= dz0) ? 0 : 1) : ((dy0 < dz0) ? 1 : (dx0 < dz0) ? 1 : 0);

  var dx1 = dx0 - off2.x + G3; // Distances for second corner
  var dy1 = dy0 - off2.y + G3;
  var dz1 = dz0 - off2.z + G3;

  var dx2 = dx0 - off3.x + 2 * G3; // Distances for third corner
  var dy2 = dy0 - off3.y + 2 * G3;
  var dz2 = dz0 - off3.z + 2 * G3;

  var dx3 = dx0 - 1 + 3 * G3; // Distances for fourth corner
  var dy3 = dy0 - 1 + 3 * G3;
  var dz3 = dz0 - 1 + 3 * G3;

  var t0 = 0.5 - dx0*dx0 - dy0*dy0 - dz0*dz0;
    if(t0<0) {
      g0 = new THREE.Vector3(0,0,0);
    } else {
      //t0 *= t0;
      var r0 = random4(X0 , Y0, Z0);  // (x,y) of grad3 used for 2D gradient
      var gx0 = -4*t0*dx0 * r0;
      var gy0 = -4*t0*dy0 * r0;
      var gz0 = -4*t0*dz0 * r0;
      g0 = new THREE.Vector3(gx0,gy0,gz0);
    }

    var t1 = 0.5 - dx1*dx1 - dy1*dy1 - dz1*dz1;
    if(t1<0) {
      g1 = new THREE.Vector3(0,0,0);
    } else {
      //t1 *= t1;
      var r1 = random4(X0+ off2.x -G3, Y0 + off2.y -G3, Z0 + off2.z -G3);
      var gx1 = -4*t1*dx1 * r1;
      var gy1 = -4*t1*dy1 * r1;
      var gz1 = -4*t1*dz1 * r1;
      g1 = new THREE.Vector3(gx1,gy1,gz1);
    }

    var t2 = 0.5 - dx2*dx2 - dy2*dy2 - dz2*dz2;
    if(t2<0) {
      g2 = new THREE.Vector3(0,0,0);
    } else {
      //t2 *= t2;
      var r2 = random4(X0+ off3.x -2*G3, Y0 + off3.y -2*G3, Z0 + off3.z -2*G3);
      var gx2 = -4*t2*dx2 * r2;
      var gy2 = -4*t2*dy2 * r2;
      var gz2 = -4*t2*dz2 * r2;
      g2 = new THREE.Vector3(gx2,gy2,gz2);
    }

    var t3 = 0.5 - dx3*dx3 - dy3*dy3 - dz3*dz3;
    if(t3<0) {
      g3 = new THREE.Vector3(0,0,0);
    } else {
      //t3 *= t3;
      var r3 =random4(X0+ 1 -3*G3, Y0 + 1 -3*G3, Z0 + 1 -3*G3);
      var gx3 = -4*t3*dx3 * r3;
      var gy3 = -4*t3*dy3 * r3;
      var gz3 = -4*t3*dz3 * r3;
      g3 = new THREE.Vector3(gx3,gy3,gz3);
    }

    var gNoise = ((new THREE.Vector3(0,0,0)).add(g0).add(g1).add(g2).add(g3)).multiplyScalar(6.3);
    return gNoise;
}

function helper(x, y, z, resolution) {
  x = (x+1.0)/2.0*resolution;
  y = (y+1.0)/2.0*resolution;
  z = (z+1.0)/2.0*resolution;

  var interpolated = intFunction(new THREE.Vector3(x, y, z));
  return interpolated;
}

function ghelper(x, y, z, resolution) {
  x = (x+1.0)/2.0*resolution;
  y = (y+1.0)/2.0*resolution;
  z = (z+1.0)/2.0*resolution;
  var interpolated = simplexGradient(new THREE.Vector3(x, y, z));
  return interpolated;
}

function getAmp(smoothness, levels){
  if(amp!=null) return amp;
  var divider = 0;
  for(var i = 0; i < levels; i++){
    divider+= Math.pow(smoothness, i);
  }
  amp = Math.pow(smoothness, levels-1)/divider;
  //console.log("amp: "+amp); //DEBUG
  return amp;
}

function PerlinNoise(x, y, z, minRes, smoothness, lacunarity, levels, cliffPosition, cliffM) {
  var c = 0.0;
  var amp = getAmp(smoothness,levels);
  var res = minRes;
  for(var l =0; l < levels; l++) {
    res =res*lacunarity;
    var noise = helper(x, y, z, res);
    c += noise*amp;
    amp/=smoothness;
  }
  if (c < cliffPosition) c *= cliffM; //cliff

  return c*2.0-1.0;
}

function PerlinNoiseGradient(x, y, z, minRes, smoothness, lacunarity, levels, cliffPosition, cliffM) {
  var c = new THREE.Vector3(0,0,0);
  var amp = getAmp(smoothness,levels);
  var res = minRes;
  for(var l =0; l < levels; l++) {
    res =res*lacunarity;
    var grad = ghelper(x, y, z, res);
    c.add(grad.multiplyScalar(amp));
    amp/=smoothness;
  }
  return c.multiplyScalar(2.0);
}

function PerlinNoiseNormal(x, y, z, minRes, smoothness, lacunarity, levels, radius, roughness) {
  var coord = new THREE.Vector3(x,y,z);
  var noise = PerlinNoise(x, y, z, minRes, smoothness, lacunarity, levels);
  var grad = PerlinNoiseGradient(x, y, z, minRes, smoothness, lacunarity, levels).multiplyScalar(1/(radius + roughness*noise));
  var h = ((new THREE.Vector3()).copy(grad)).sub(coord.multiplyScalar(grad.dot(coord)));
  var n = (new THREE.Vector3(x,y,z)).sub(h.multiplyScalar(roughness));
  return n;
}


function RidgedNoise(x, y, z, minRes, smoothness, lacunarity, levels, cliffPosition, cliffM) {
  var c = 0.0;
  var weight = 1.0;
  var gain = 2.0
  var amp = getAmp(smoothness,levels);
  var res = minRes;
  for(var l = 0; l < levels; l++) {
    res =res*lacunarity;
    var noise = helper(x, y, z, res);

    //Make the ridges
    noise = Math.abs(noise*2 -1);
    noise = (1 -noise);
    noise*=noise;  //sharpen the ridges
    noise*=weight; //make sharp points along the ridges

    //update the weigths using the gain and the noise
    weight = Math.max(Math.min(noise*gain, 1),0);

    c += noise*amp;
    amp/=smoothness;
  }
  if (c < cliffPosition) c *= cliffM; //cliff

  return c*2.0-1.0;
}

//Retrieve simplex noise normal using simplex noise gradient
function getNormal( position, smoothness, scale, radius, roughness, lacunarity){
  var cliff = cliff || [0.5, 1.0] // [position, multiplyFactor]
  var scale = scale || 512;
  var lacunarity = lacunarity || 2.0;
  var w = (new THREE.Vector3()).copy(position);
  w.normalize();
  var normal = PerlinNoiseNormal(w.x ,w.y ,w.z, scale*2.0, smoothness, lacunarity, nOctaves, radius, roughness);
  return normal.multiplyScalar(100).normalize();
}

function getHeight( position, smoothness, scale, cliff, lacunarity){
  var cliff = cliff || [0.5, 1.0] // [position, multiplyFactor]
  var scale = scale || 512;
  var lacunarity = lacunarity || 2.0;
  var w = (new THREE.Vector3()).copy(position);
  w.normalize();
   height = noiseFunction(w.x ,w.y ,w.z, scale, smoothness, lacunarity, nOctaves, cliff[0], cliff[1]);
  return height;
}


function perturbVector(v, smoothness, roughness, scale, cliff, lacunarity){
  var h = getHeight(v, smoothness, scale, cliff, lacunarity);
  var w = (new THREE.Vector3()).copy(v);
  v.add(w.normalize().multiplyScalar(h*roughness));
}


function perturbGeometry(geometry, smoothness, roughness, scale, cliff, lacunarity){
  amp = null;
  var roughness = roughness || 1.0;
  var smoothness = smoothness || 2.0;
  for(i in geometry.vertices){
     var v = geometry.vertices[i];
     perturbVector(v, smoothness, roughness, scale, cliff, lacunarity);
  }
}



//Help functions

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


function getVector(r, t, g){
  var x = r*Math.sin(t)*Math.cos(g);
  var y = r*Math.sin(t)*Math.sin(g);
  var z = r*Math.cos(t);
  var v = new THREE.Vector3(x,y,z);
  return v;
}
