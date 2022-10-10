# Beating Z-Fighting

![Screenshot from 2022-10-10 11-59-30](https://user-images.githubusercontent.com/6391152/194927006-40620a3f-7443-4b84-9add-a5fc6f39b1a8.png)


## polygon offset
- component is working, but it's not some simple panacea for every situation
- see index.html
- tldr: add it to the element you want to background
- you may need to adapt it to fit your meshes, though; expect this to take tuning
> [...when actually rendered], the visual quality when overlaying lines on a model is quite poor, because the lines depth fight with the triangles. The rasterization of the lines does not match the rasterization of the edges of the triangles. The traditional way to avoid this depth fighting is to use glPolygonOffset or similar. glTF 2.0, however, does not support specifying a polygon offset. Even if it did - or an extension were defined to support it - it's very difficult to get high quality rendering with this approach. Depending on the polygon offset values chosen, lines on the back-face may "bleed through" to the front because of too much depth bias, or lines may have a stipled look due to too little depth bias. Even with careful tuning of the polygon offset values, it's usually possible to detect both problems simultaneously in a single scene.
-- https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/CESIUM_primitive_outline/README.md

![image](https://user-images.githubusercontent.com/6391152/194926966-9f3d8453-4f1a-4d89-b96c-fb921398fb75.png)
see: https://a-polygon-offset.glitch.me/a-decal.html

## THREE.DecalGeometry
- features a simplified THREE.js demo copied from a broken fiddle in /three-demo.html
- also features an attempt to duplicate that demo in A-Frame, in /aframe-demo.html
- a-decal.js is an expanded version of that demo that is more generalized
