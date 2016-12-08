function generateTexturesAndCubeMaps(baseColor, resolution, rangeFactor, smoothness, s){
  var textureMaps = [];
  var cubeBuffers = [];
  var resolution = resolution || 1024;
  var rangeFactor = rangeFactor || 1.0;
  var smoothness = smoothness || 2.0;
  var s = s || 'B';

  for (var index = 0; index < 6; index++) {
     var rtarget = new THREE.WebGLRenderTarget(resolution, resolution, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat});

     var textureCamera = new THREE.OrthographicCamera(-resolution/2, resolution/2, resolution/2, -resolution/2, -100, 100);
     textureCamera.position.z = 10;

     var textureScene = new THREE.Scene();
     var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(resolution, resolution),
        new textureGenerator(index, resolution, baseColor, rangeFactor, smoothness)
     );
     plane.position.z = -10;
     textureScene.add(plane);

     renderer.render(textureScene, textureCamera, rtarget, true);
     if(s=='C' || s=='B'){
       var buffer = new Uint8Array(resolution * resolution * 4);
       var gl = renderer.getContext();
       gl.readPixels( 0, 0, resolution, resolution, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
       cubeBuffers.push(textureBufferTo2D11array(buffer, resolution));
     }

     if(s=='T' || s=='B'){
       //console.log(rtarget);
       textureMaps.push(rtarget.texture);
     }

  }

   //console.log(cubeBuffers);
   return [textureMaps, cubeBuffers];

}

function generateCubeMaps(baseColor, resolution, rangeFactor, smoothness){
 return  generateTexturesAndCubeMaps(baseColor, resolution, rangeFactor, smoothness, 'C')[1];

}

function generateTextures(baseColor, resolution, rangeFactor){
 return  generateTexturesAndCubeMaps(baseColor, resolution, rangeFactor, smoothness, 'T')[0];

}

function textureBufferTo2D11array(buffer, dim){
  var darray = [];
  for(var i = 0; i < dim; i++){
    darray[i]= [];
    for (var j=0; j< dim; j++){
      var index = i*dim*4 + j*4;
      var value = buffer[index];
      value = value/255.0;
      value= value*2.0 -1.0;
      darray[i][j]= value;
    }
  }
  return darray;
}



var textureGenerator = function(index, resolution, baseColor, rangeFactor, smoothness){
  var vertexShader = "\
  		varying vec2 vUv;\
      varying vec3 vPosition;\n\
      uniform float resolution;\n\
  		\
  		void main() {\
  			vUv = uv;\
        vPosition = position/resolution;\n\
  			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
  		}\
  	";

  	var fragmentShader = "\
  		varying vec2 vUv;\n\
      varying vec3 vPosition;\n\
      uniform vec3 baseColor;\n\
      uniform int index;\n\
  		uniform float resolution;\n\
      uniform float rangeFactor;\n\
      uniform float smoothness;\n\
  		\
  		int mod(int x, int m) {\n\
  			return int(mod(float(x), float(m)));\n\
  		}\n\
  		\
  		float random5(vec3 co) {\n\
  			return fract(sin(dot(co.xyz ,vec3(12.9898,78.233,1.23456))) * 5356.5453);\n\
  		}\n\
  		\
  		\
  		float random4(float x, float y, float z) {\n\
  			return random5(vec3(x, y, z));\n\
  		}\n\
  		\
  		float random4(int x, int y, int z) {\n\
  			return random4(float(x), float(y), float(z));\n\
  		}\n\
  		\
  		float interpolation(float a, float b, float x) {\n\
  			float ft = x * 3.1415927;\n\
  			float f = (1.0 - cos(ft)) * 0.5;\n\
  			return a*(1.0-f) + b*f;\n\
  		}\n\
  		\
  		float tricosine(vec3 coordFloat) {\n\
  			vec3 coord0 = vec3(floor(coordFloat.x), floor(coordFloat.y), floor(coordFloat.z));\n\
  			vec3 coord1 = vec3(coord0.x+1.0, coord0.y+1.0, coord0.z+1.0);\n\
  			float xd = (coordFloat.x - coord0.x)/max(1.0, (coord1.x-coord0.x));\n\
  			float yd = (coordFloat.y - coord0.y)/max(1.0, (coord1.y-coord0.y));\n\
  			float zd = (coordFloat.z - coord0.z)/max(1.0, (coord1.z-coord0.z));\n\
  			float c00 = interpolation(random4(coord0.x, coord0.y, coord0.z), random4(coord1.x, coord0.y, coord0.z), xd);\n\
  			float c10 = interpolation(random4(coord0.x, coord1.y, coord0.z), random4(coord1.x, coord1.y, coord0.z), xd);\n\
  			float c01 = interpolation(random4(coord0.x, coord0.y, coord1.z), random4(coord1.x, coord0.y, coord1.z), xd);\n\
  			float c11 = interpolation(random4(coord0.x, coord1.y, coord1.z), random4(coord1.x, coord1.y, coord1.z), xd);\n\
  			float c0 = interpolation(c00, c10, yd);\n\
  			float c1 = interpolation(c01, c11, yd);\n\
  			float c = interpolation(c0, c1, zd);\n\
  			\
  			return c;\n\
  		}\n\
  		\
  		float nearestNeighbour(vec3 coordFloat) {\n\
  			return random4(int(floor(coordFloat.x)), int(floor(coordFloat.y)), int(floor(coordFloat.z)));\n\
  		}\n\
  		\
  		float helper(float x, float y, float z, float resolution) {\n\
  			x = (x+1.0)/2.0*resolution;\n\
  			y = (y+1.0)/2.0*resolution;\n\
  			z = (z+1.0)/2.0*resolution;\n\
  			\n\
  			vec3 coordFloat = vec3(x, y, z);\n\
        float interpolated = tricosine(coordFloat);\n\
  			//float interpolated = nearestNeighbour(coordFloat);\n\
  			return interpolated;\n\
  		}\n\
  		\
  		vec3 scalarField(float x, float y, float z, float maxRes, float smoothness) {\n\
        float c = 0.0;\n\
        float amp = 0.56;\n\
        for(int l = 6; l > 0; l--) {\n\
          float res = maxRes/pow(2.0,float(l));\n\
          float level = helper(x, y, z, res);\n\
          c += level*amp;\n\
          amp/=smoothness;\n\
        }\n\
  			//if (c < 0.5) c *= 0.9;\n\
  			\n\
  			c = clamp(c, 0.0, 1.0);\n\
  			\n\
  			return vec3(c, c, c);\n\
  		}\n\
  		\
  		vec3 getSphericalCoord(int index, float x, float y, float width) {\n\
  			width /= 2.0;\n\
  			x -= width;\n\
  			y -= width;\n\
  			vec3 coord = vec3(0.0, 0.0, 0.0);\n\
  			\
  			if (index == 0) {coord.x=width; coord.y=-y; coord.z=-x;}\n\
  			else if (index == 1) {coord.x=-width; coord.y=-y; coord.z=x;}\n\
  			else if (index == 2) {coord.x=x; coord.y=width; coord.z=y;}\n\
  			else if (index == 3) {coord.x=x; coord.y=-width; coord.z=-y;}\n\
  			else if (index == 4) {coord.x=x; coord.y=-y; coord.z=width;}\n\
  			else if (index == 5) {coord.x=-x; coord.y=-y; coord.z=-width;}\n\
  			\
  			return normalize(coord);\n\
  		}\
  		\
  		void main() {\n\
  			float x = vUv.x;\n\
        float y = 1.0 - vUv.y;\n\
        //x = 0.5+vPosition.x;\n\
  			//y = 1.0 - (0.5+vPosition.y);\n\
  			vec3 sphericalCoord = getSphericalCoord(index, x*resolution, y*resolution, resolution);\n\
  			\
  			vec3 grad = scalarField(sphericalCoord.x, sphericalCoord.y, sphericalCoord.z, 512.0, smoothness);\n\
            vec3 color = baseColor + (grad-0.5)/rangeFactor;\n\
  			\
  			gl_FragColor = vec4(color.xyz, 1.0);\n\
  		}\
  	";

  	var uniforms = {
  		index: {type: "i", value: index},
      resolution: {type: "f", value: resolution},
      baseColor: {type: "v3", value: baseColor},
      rangeFactor: {type:"float", value:rangeFactor},
      smoothness: {type:"float", value:smoothness}
  	};

  	return new THREE.ShaderMaterial({
  		uniforms: uniforms,
  		vertexShader: vertexShader,
  		fragmentShader: fragmentShader
  	});

}
