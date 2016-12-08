/* PARAMETERS */
var n = 7;
var dim = Math.pow(2, n) + 1; // detail of the spheres
var radius = 100; // terrain and water sphere radius

// terrain parameters
var roughness = 0.1*radius;

// Perlin/Simplex/Ridged parameters
var seed = Math.random()*100;
var smoothness = 1.8;
var scale = 0.5; // resolution in the slides
var lacunarity = 2.0;
var cliff = [0.52, 1.0];

var rotationSpeed = 0.0001; // planet rotation speed.

var DSQUARE = false; // diamond square algorithm, not implemented for CLOD

//CLOD parameters
var CLOD = true; //Chunked Level of detail, overrides DSQUARE
var QTGPU = false; //vertex displacement in GPU for CLOD
var GNORMALS = false; // only with CLOD in CPU (QTGPU=false) and with simplex noise non ridged




//Canvas
var renderer = new THREE.WebGLRenderer({ antialiasing: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Camera
var ratio = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(45, ratio, 1, 50*radius);
camera.position.z = radius*6;
camera.position.y =0;
camera.lookAt(new THREE.Vector3(0, 0, 0));

var scene = new THREE.Scene();
var controls = new THREE.OrbitControls(camera, renderer.domElement);

//Lights
//scene.add( new THREE.AmbientLight( 0x444444 ) );
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set( radius*10, radius*10, radius*10 );
scene.add( directionalLight );
//Water Shader
waterMesh = new THREE.Mesh(new THREE.SphereGeometry( radius, dim-1, dim-1 ), getCustomMaterial(directionalLight,"img/waternormals.jpg", document.getElementById('water_fragmentShader').innerHTML));
waterMesh.material.wrapS = waterMesh.material.wrapT = THREE.RepeatWrapping;
waterMesh.receiveShadow = true;

//Sky Shader
var sky = new THREE.Mesh(new THREE.SphereGeometry(radius*15, dim-1, dim-1), new THREE.MeshBasicMaterial());
sky.material.map = new THREE.TextureLoader().load( "img/space.png" );
sky.material.side = THREE.BackSide;
scene.add(sky);

//Atmosphere Shader
var atm = new THREE.Mesh(new THREE.SphereGeometry(radius+roughness+1, dim-1, dim-1), getCustomMaterial(directionalLight,"img/gradient.jpg", document.getElementById('atm_fragmentShader').innerHTML));
atm.material.side = THREE.BackSide;

//Clouds Shader
//var clouds_geometry = new THREE.BoxGeometry(5, 5, 5, dim-1, dim-1, dim-1);
var clouds_geometry = new THREE.SphereGeometry(radius+roughness, dim-1, dim-1);
var cloudsArray = getCloudsMaterial(directionalLight);
//backside
cloudsMeshFront = new THREE.Mesh(clouds_geometry, cloudsArray[0]);
//cloudsMesh.material.wrapS = waterMesh.material.wrapT = THREE.RepeatWrapping;
cloudsMeshFront.material.transparent =true;

//frontside
var cloudsMesh = new THREE.Mesh(clouds_geometry, cloudsArray[1]);
//cloudsMesh.material.wrapS = waterMesh.material.wrapT = THREE.RepeatWrapping;
cloudsMesh.material.transparent =true ;
cloudsMesh.add(cloudsMeshFront);

setSeed(seed); //Seed for procedural generation

var geometry = null;
if (CLOD) geometry = new THREE.SphereGeometry(0.1,1,1); //Hook Geometry for CLOD
else if(!DSQUARE){

  //Spherical Cube Geometry
  //geometry = new THREE.BoxGeometry(5, 5, 5, dim-1, dim-1, dim-1);
  //Spherify(geometry, radius);

  //Icosahedral Geometry
  geometry = new THREE.IcosahedronGeometry(radius, n);

  //Sphere Geometry
  //geometry = new THREE.SphereGeometry(radius, dim-1,dim-1);

  //Perlin Noise Sphere
  //var terrains = generateCubeMaps(new THREE.Vector3(0.5,0.0,0.0), dim, 1.0, smoothness);
  //modelSphere(geometry, terrains, roughness);

  //General perlin noise perturbation
  perturbGeometry(geometry, smoothness, roughness, scale, cliff, lacunarity);
  geometry.computeVertexNormals();
}
else{
  //Spherical Cube Geometry
  geometry = new THREE.BoxGeometry(5, 5, 5, dim-1, dim-1, dim-1);
  Spherify(geometry, radius);

  //Diamond Square Cube Sphere
  var terrains2 = CubeTerrain(n, roughness);
  modelSphere(geometry, terrains2, roughness,[4,5,1,0,2,3]);

  geometry.computeVertexNormals();
}
//using predefined Textures
var mesh = new THREE.Mesh(geometry, getMaterial(directionalLight));

//using perlin Noise Textures
//var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(getMaterialArray(directionalLight)));



if(CLOD){
   var qMaterial = QTGPU?getQuadMaterial(directionalLight , seed, roughness, smoothness, scale, lacunarity, 16, 1, 0.001): //quadtree QTGPU
                       getMaterial(directionalLight); //quadtree CPU
   var quadSphere = new QuadSphere(radius, qMaterial, mesh);
}

mesh.add( cloudsMesh ); //clouds
mesh.add( waterMesh ); //water
//mesh.add(atm); //atmosphere

scene.add(mesh);


//Animation
function animate() {
    //waterMesh.rotation.z += 0.001;
    requestAnimationFrame(animate);
    waterMesh.material.uniforms.time.value += 0.01 / 60.0;
    cloudsMesh.material.uniforms.time.value += 0.01 / 60.0;
    //controls.speedMult = Math.min(1,Math.max(0.01,(camera.position.length()- radius)/(1*radius)));

    if(CLOD)quadSphere.draw(camera);
    //mesh.position.x +=0.1;
    mesh.rotation.y+= rotationSpeed;

    mesh.material.uniforms.lightPosition.value = directionalLight.position;
    cloudsMesh.material.uniforms.lightPosition.value = directionalLight.position;
    waterMesh.material.uniforms.lightPosition.value = directionalLight.position;
    controls.update();
    //water.render();
    renderer.render(scene, camera);
}
animate();
