/* global THREE, AFRAME */

// https://sites.google.com/site/threejstuts/home/polygon_offset
// http://jsfiddle.net/jmcjc5u/rbkwzsxv/
// http://what-when-how.com/opengl-programming-guide/polygon-offset-blending-antialiasing-fog-and-polygon-offset-opengl-programming/
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
// https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
// https://stackoverflow.com/questions/49096626/three-js-what-is-more-efficient-to-layer-and-resolve-z-fighting-using-polygono
// https://stackoverflow.com/a/31541369/4526479



AFRAME.registerComponent('polygon-offset', {
  // use this with positive numbers to push this material further away from camera / background this mesh
  schema: {
    polygonOffsetFactor: { type: 'number', default: 4 },
    polygonOffsetUnits: { type: 'number', default: 1 },
    // physicalOffset: {},
    // render-order seems like it would be helpful here as well...
    depthWrite: { type: 'boolean', default: true},
    debug: { type: 'boolean', default: false},
  },
  init() {
    try {
      this.offsetMaterial(this.el.object3D);
    } catch (e) {
      if (this.data.debug) console.warn("error attempting polygon offset; will add event listener and assume model wasn't laoded",e)
      this.el.addEventListener('model-loaded', () => {
        this.offsetMaterial(this.el.object3D);
      })
    }
  },
  offsetMaterial (object3D) {
    if (this.data.debug) console.log('will attempt polygon offset:',object3D)
    
    if (object3D.type === "Mesh") object3D = {children:[object3D]};
    
    object3D.children.forEach((node) => {
      if (this.data.debug) console.log('node',node)
      if (node.type !== 'Mesh') return;
      let newMaterial = node.material.clone();
      newMaterial.polygonOffset = true;
      newMaterial.polygonOffsetFactor = this.data.polygonOffsetFactor;
      newMaterial.polygonOffsetUnits = this.data.polygonOffsetUnits;
      newMaterial.depthWrite = this.data.depthWrite;
      // object3D.originalColor = node.material.color;
      node.material.dispose();
      node.material = newMaterial;
      if (this.data.debug) console.log('added polygon offset to', node, node.material)
    });
  }
});



// could attempt to implement other method shown here:
AFRAME.registerComponent('z-index-back', {
  init() {
    
  }
});

AFRAME.registerComponent('z-index-front', {
  init() {
    
  }
});






/*
  const geometry =  new DecalGeometry( mesh, position, orientation, size );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  */
// see: https://threejs.org/docs/#examples/en/geometries/DecalGeometry
// see: https://github.com/mrdoob/three.js/blob/master/examples/webgl_decals.html
// see: https://threejs.org/examples/#webgl_decals

AFRAME.registerComponent('decal-geometry', {
  schema: {
    cloneMaterialFrom: { type:'selector' }, // pass in the selector of what material should be cloned and used as decal
    src: { type:'string', default:''},      // pass in a URL to just make a new material with an image set to src on it
    useOwnMaterial: { type:'boolean', default:true},
  },
  
  init() {
    try {
      this.delayedInit();
    } catch (e) {
      setTimeout(this.delayedInit.bind(this),2000)
      this.el.addEventListener('model-loaded', () => {
        this.delayedInit();
      })
    }
  },
  
  delayedInit() {
    let parentMesh = this.getMesh(this.el.parentEl.object3D);
    // let parentMesh = parentMeshes[0];
    // let parentPosition = this.el.parentEl.object3D.position
    
    console.log('parentMeshes', parentMesh, this.el.parentEl.object3D);

    console.log([
      parentMesh,
      this.el.object3D.position,
      (new THREE.Euler()).setFromVector3(this.el.object3D.rotation),
      this.el.object3D.scale,
    ])
    
    const decalGeometry = new THREE.DecalGeometry(
      parentMesh,
      this.el.object3D.position,
      (new THREE.Euler()).setFromVector3(this.el.object3D.rotation),
      this.el.object3D.scale,
    );

    let decalMaterial;
    
    if ("experimenting") {
      this.decalMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://cdn.glitch.global/a5690e54-af54-41cd-85d9-b745739e4a11/00055.png?v=1664334108075'), 
        color: 0xffffff,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetUnit: - 1,
        polygonOffsetFactor: - 4,
      });
    }
    else if (this.data.useOwnMaterial) {
      let elMesh = this.getMesh(this.el.object3D);
      decalMaterial = elMesh.material;
    }
    // else if (this.data.src) {
    //   this.el.setAttribute('material', {src: this.data.src});
    //   let elMesh = this.getMesh(this.el.object3D);
    //   decalMaterial = elMesh.material;
    // }
    else {
      decalMaterial = this.cloneMaterialOfEl(this.data.cloneMaterialFrom) // decalMaterial.clone()
    }
    
    console.log(decalGeometry, this.decalMaterial)
    const decalMesh = new THREE.Mesh(decalGeometry, this.decalMaterial);
    // now what do I do with it? scene.add() ...?
    // seems like this is what is done in A-Frame I think:
    // this.el.setObject3D('mesh', decalMesh);
    let decal = createEl('a-entity', {id:'decal-attempt'});
    // decal.object3D.add(decalMesh);
    this.el.appendChild(decal);
    
    decal.setObject3D('mesh', decalMesh);
    // this.el.sceneEl.object3D.add(decalMesh);
  },
  
  getMesh(object3D) {
    // assumes 1 mesh, at surface level--may be wrong assumption
    let meshes = object3D.children.filter(node => node.type === "Mesh");
    if (meshes.length > 1) console.warn("grabbing first mesh, but there were several...",meshes)
    return meshes[0];
  },
  
  cloneMaterialOfEl(el) {
    let mesh = this.getMesh(el.object3D);
    return mesh.material.clone();
  },
  
  cloneMeshMaterial(object3D) {
    object3D.traverse(function (node) {
      if (node.type !== 'Mesh') return;
      let newMaterial = node.material.clone();
      object3D.originalColor = node.material.color;
      node.material.dispose();
      node.material = newMaterial;
    });
  },
});

// attempt to implement decal geometry as a primtive
var extendDeep = AFRAME.utils.extendDeep;

// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-poster', extendDeep({}, meshMixin, {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    geometry: {primitive: 'plane'},
    'decal-geometry': {},
  },

  // Defined mappings from HTML attributes to component properties (using dots as delimiters).
  // If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));




AFRAME.registerComponent('debug-object3d-mesh', {
  schema: { type: 'string', default: 'object3d-'+Math.random()},
  init() {
    window[this.data] = [];
    this.el.object3D.traverse(node => {
      if (node.type !== 'Mesh') return;
      window[this.data].push(node);
    })
  },

});

function createEl(tag, attrs, children) {
  let el = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(attr => {
      el.setAttribute(attr, attrs[attr])
    })
  }
  if (children) {
    children = Array.isArray(children) ? children : [children];
    for (let child of children) {
      if (typeof child === "number") child = ""+child;
      if (typeof child === "string") {
        el.insertAdjacentText("afterbegin", child);
      }
      else {
        try {
          el.appendChild(child)
        } catch (e) {
          debugger
        }
      }
    }
  }
  return el;
};
