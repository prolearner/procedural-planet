function getMaterial(light){
  var lightColor = light.color.clone();
  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = document.getElementById('fragmentShader').innerHTML;


  var uniforms = {    // custom uniforms (your textures)

      tex_sand: { type: "t", value: new THREE.TextureLoader().load( "img/sand1.jpg" ) },
      tex_grass: { type: "t", value: new THREE.TextureLoader().load( "img/grass1.jpg" ) },
      tex_stone: { type: "t", value: new THREE.TextureLoader().load( "img/stone1.jpg" ) },
      tex_snow: { type: "t", value: new THREE.TextureLoader().load( "img/snow1.jpg" ) },

      vMax: { type: "f", value: roughness },
      vRadius: {type: "f", value: radius},

      lightPosition: {type: 'v3', value: light.position.clone()},
      lightColor: {type: 'v4', value:  new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
      lightIntensity: {type: 'f', value: light.intensity}

  };
  var meshFaceMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      wireframe: false
  });
  return meshFaceMaterial;

}

function getQuadMaterial(light, seed, roughness, smoothness, scale, lacunarity, nOctaves, resolution, dNormals){
  var lightColor = light.color.clone();
  var vertShader = document.getElementById('quad_vertexShader').innerHTML;
  var fragShader = document.getElementById('fragmentShader').innerHTML;
  var amp = getAmp(smoothness, nOctaves);


  var uniforms = {    // custom uniforms (your textures)

      tex_sand: { type: "t", value: new THREE.TextureLoader().load( "img/sand1.jpg" ) },
      tex_grass: { type: "t", value: new THREE.TextureLoader().load( "img/grass1.jpg" ) },
      tex_stone: { type: "t", value: new THREE.TextureLoader().load( "img/stone1.jpg" ) },
      tex_snow: { type: "t", value: new THREE.TextureLoader().load( "img/snow1.jpg" ) },

      vMax: { type: "f", value: roughness },
      vRadius: { type: "f", value: radius },
      roughness: { type: "f", value: roughness },
      seed: {type: "f", value: seed},
      smoothness: {type: "f", value: smoothness},
      scale: {type: "f", value: scale},
      amp: {type: "f", value: amp},
      lacunarity: {type: "f", value: lacunarity},
      nOctaves: {type: "i", value: nOctaves},
      resolution: {type: "f", value: resolution},
      d: {type: "f", value: dNormals},

      lightPosition: {type: 'v3', value: light.position.clone()},
      lightColor: {type: 'v4', value:  new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
      lightIntensity: {type: 'f', value: light.intensity}

  };
  var meshFaceMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      wireframe: false
  });
  return meshFaceMaterial;

}


function getCustomMaterial(light, tex, frag){
  var lightColor = light.color.clone();
  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = frag;


  var uniforms = {    // custom uniforms (your textures)

      tex: { type: "t", value: new THREE.TextureLoader().load( tex ) },
      time: {type: 'f', value: 0.0},

      eye: {type: 'v3', value: camera.position },

      vRadius: {type: "f", value: radius},

      lightPosition: {type: 'v3', value: light.position.clone()},
      lightColor: {type: 'v4', value: new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
      lightIntensity: {type: 'f', value: light.intensity}

  };
  var meshFaceMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true
  });
  return meshFaceMaterial;

}

function getCloudsMaterial(light, tex){
  var lightColor = light.color.clone();
  var rangeFactor =1.0;
  var resolution = 1024.0;
  var baseColor = new THREE.Vector3(0.5,0.5,0.5);
  var smoothness = 2.0;
  var seed = Math.random()*100;
  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = document.getElementById('clouds_motion_fragmentShader').innerHTML;


  var uniforms = {    // custom uniforms (your textures)

      time: {type: 'f', value: 0.0},

      lightPosition: {type: 'v3', value: light.position.clone()},
      lightColor: {type: 'v4', value: new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
      lightIntensity: {type: 'f', value: light.intensity},

      resolution: {type: "f", value: resolution},
      baseColor: {type: "v3", value: baseColor},
      rangeFactor: {type:"f", value:rangeFactor},
      smoothness: {type:"f", value:smoothness},
      seed: {type:"f", value:seed}


  };
  var meshFaceMaterialFront = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      side: THREE.FrontSide
  });
  var meshFaceMaterialBack = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      side: THREE.BackSide
  });

  return [meshFaceMaterialBack, meshFaceMaterialFront];

}

function getMaterialArray(light){
  var lightColor = light.color.clone();
  var rangeFactor =2.0;
  var resolution = 1024;
  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = document.getElementById('terrains_fragmentShader').innerHTML;
  var sandMaps = generateTextures(new THREE.Vector3(0.89,0.86,0.41), resolution, rangeFactor);
  var grassMaps = generateTextures(new THREE.Vector3(0.0,0.5,0.0), resolution, rangeFactor);
  var rockMaps = generateTextures(new THREE.Vector3(0.37,0.37,0.37), resolution, rangeFactor);
  var snowMaps = generateTextures(new THREE.Vector3(1.0,1.0,1.0), resolution, rangeFactor);
  //console.log(rockMaps[0]);

  var ma = [];
	for (var i = 0; i < 6; i++) {
    var uniforms = {    // custom uniforms (your textures)

        tex_sand: { type: "t", value: sandMaps[i] },
        tex_grass: { type: "t", value: grassMaps[i] },
        tex_stone: { type: "t", value: rockMaps[i] },
        tex_snow: { type: "t", value: snowMaps[i] },

        vMax: { type: "f", value: roughness },
        vRadius: {type: "f", value: radius},

        lightPosition: {type: 'v3', value: light.position.clone()},
        lightColor: {type: 'v4', value: new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
        lightIntensity: {type: 'f', value: light.intensity}

    };
    var meshFaceMaterial = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: shaderParse(vertShader),
        fragmentShader: shaderParse(fragShader)
    });

		ma.push(meshFaceMaterial);
	}
  return ma;

}

function getCloudsArrayMaterial(light){
  var lightColor = light.color.clone();
  var rangeFactor =1.0;
  var resolution = 512;
  var grayLevel = 0.5;
  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = document.getElementById('clouds_fragmentShader').innerHTML;
  var cloudsMaps = generateTextures(new THREE.Vector3(grayLevel,grayLevel,grayLevel), resolution, rangeFactor);
  //console.log(cloudsMaps[0]);

  var backside = [];
  var frontside = []
	for (var i = 0; i < 6; i++) {
    var uniforms = {    // custom uniforms (your textures)

        tex_clouds: { type: "t", value: cloudsMaps[i] },

        vMax: { type: "f", value: roughness },
        vRadius: {type: "f", value: radius},

        lightPosition: {type: 'v3', value: light.position.clone()},
        lightColor: {type: 'v4', value: new THREE.Vector4(lightColor.r, lightColor.g, lightColor.b, 1.0)},
        lightIntensity: {type: 'f', value: light.intensity},


    };
    var meshCloudsMaterial1 = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: shaderParse(vertShader),
        fragmentShader: shaderParse(fragShader),
        side: THREE.BackSide,
        transparent: true,
    });

		backside.push(meshCloudsMaterial1);

    var meshCloudsMaterial2 = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: shaderParse(vertShader),
        fragmentShader: shaderParse(fragShader),
        side: THREE.FrontSide,
        transparent: true,
    });

    frontside.push(meshCloudsMaterial2);
	}
  return [backside,frontside];

}


function color(nheight, slope) {
    if (nheight < 0) {
        var color = new THREE.Color(0x3399ff);
    }
    else if (nheight < 0.25) {
        var color = new THREE.Color(0x009933);
    }
    else if (nheight < 0.7) {
        var color = new THREE.Color(0x999999);
    }
    else {
        var color = new THREE.Color(0xFFFFFF);
    }
    var b = (slope*0.2);
    color.setRGB(color.r + b, color.g + b, color.b + b);
    return color;
}

function setTexture(nheight) {
    if (nheight < 0) {
        var index = 0;
    }
    else if (nheight < 0.25) {
        var index = 1;
    }
    else if (nheight < 0.7) {
        var index = 2;
    }
    else {
        var index = 3;
    }
    return index;
}

function shaderParse(glsl) {
    glsl.replace(/\/\/\s?chunk\(shadowmap_pars_fragment\);/g, 'THREE.ShaderChunk[shadowmap_pars_fragment]');
    glsl.replace(/\/\/\s?chunk\(shadowmap_fragment\);/g, 'THREE.ShaderChunk[shadowmap_fragment]');
    glsl.replace(/\/\/\s?chunk\(shadowmap_pars_vertex\);/g, 'THREE.ShaderChunk[shadowmap_pars_vertex]');
    glsl.replace(/\/\/\s?chunk\(shadowmap_vertex\);/g, 'THREE.ShaderChunk[shadowmap_vertex]');
    return glsl;
}
