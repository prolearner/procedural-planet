# 3D Procedural Planet WebGL

![Imgur](http://i.imgur.com/3MAGabc.jpg)

### [Try the Demo!](https://prolearner.github.io/procedural-planet/)
To display the Procedural Planet open index.html in a Web browser as Firefox/Chrome/Edge...

List of Files:

* js
	* main.js
	* GradientNoise.js
	* DiamondSquare.js
	* materials.js
	* quadTree.js
	* Utils.js
* shader
	* material.js

* index.html

### main.js
Main javascript file in which there are the parameters' definitions and the initialization of the WebGL environment.

**Global Parameters**

+ `n`: dimensionality (necessary for diamond square, and used also for the other noises)
+ `dim`: 2^n points that make the planet
+ `radius`: radius of the planet
+ `roughness`: roughness of the terrain

**Noise Parameters**

+ `seed`: seed of the pseudo-random generator
+ `smoothness`: smoothness of the noise
+ `scale`: resolution of FBM
+ `lacunarity`: lacunarity of FBM
+ `cliff`: noise value and multiplier to make a cliff in the noise.


After setting WebGL canvas the camera object is created. Default implementation is a Perspective Camera.
Then mouse controls and the scene are defined.
The light used is directional.

Then Sky, Water and Atmosphere Shader. The last one is commented out and can be improved to simulate
the atmospheric scattering. All three shaders are spherical meshes.

After that 2 clouds meshes are created, one textured on the outside and the other on the inside.
This resolves some graphics glitches that appear when using a double-textured transparent sphere.

The geometry and textures for the planet can be done in various ways, selectable trough comments:

+ Perlin Based (Perlin, Ridge, Simplex Noise)
	+ Geometry
		+ Sphere Geometry
		+ Spherical Cube Geometry
		+ Icosahedron Geometry (Default)
+ Diamond Square Based
	+ Geometry
		+ Spherical Cube Geometry
+ Texture
	+ Triplanar Texturing (Default)
	+ Procedural "Perlin Noise" Texturing

Level Of Detail can be enabled with Chunked LOD setting CLOD=true if we want LOD in CPU
or QTGPU=true if we want LOD in GPU.

Finally all the 5 meshes are inserted into the scene and rendered with the animate() function.

### GradientNoise.js
Contains all the variable and methods for "Perlin Based" Noise. you can choose the method changing the first 2
variables of the file:

- `noiseFunction:` indicates the noise function used. It can be "RidgedNoise" or "PerlinNoise".
- `intFunction:` indicates the interpolation used in the noise function. It can be "tricosine" for the classic Perlin Noise or "simplex" for the more efficient Simplex noise.
- `nOctaves:` number of noise levels for Fractional Brownian Motion.

### DiamondSquare.js
Contains all the variables and methods for the Diamond-Square Noise.

### materials.js
Contains all the variables and methods for textures.

+ `getMaterial()`
    Standard function to create a material in ThreeeJS with 4 textures: sand, grass, stone and snow.
    It uses triplanar texturing interpolation in the fragment shader and a simple vertex shader.
+ `getQuadMaterial()`
    Function to create a material with 4 textures for Chunked LOD.
    It uses triplanar texturing interpolation in the fragment shader and a modified vertex shader
    for GPU vertex displacement and normal computation (performance are poor).
+ `getCustomMaterial()`
    Same as getMaterial() but has the texture and the fragment shader as arguments. It's used by the Water, Sky,
    Atmosphere and shader in main.js
+ `getCloudsMaterial()`
    Function to create material for Clouds Shader.
    It uses a modified fragment shader to simulate motion and a simple vertex shader.
+ `getMaterialArray()`
    Function used to create an Array of 6 materials in ThreeJS with 4 textures, using the spherify cube method.
    It uses Procedural "Perlin Noise" Texturing in the fragment Shader and simple vertex shader.
+ `getCloudsMaterialArray()`
    Same as getMaterialArray() but used for clouds.

### quadTree.js
Contains all the variable and methods for Level of Detail based on Chunked LOD.
some parameter can be modified as the number of persistent levels in the tree, the quad-tree depth and the chunk size.

### shader/material.js
Function used to create Procedural "Perlin Noise" Textures. (used for static clouds and procedural terrain textures)

### index.html
Contains the HTML5 canvas for WebGL and all the vertex and fragment shaders.
c
