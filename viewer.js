// viewer.js — interactive 3D viewer
//  - single STL:        <div class="stl-viewer" data-src="models/part.stl"></div>
//  - STL with dropdown: <div class="stl-switcher"><select class="model-select">...</select><div class="stl-viewer"></div></div>
//  - OBJ assembly:      <div class="obj-viewer" data-src="models/asm.obj"></div> + sibling <div class="components"></div>
// Requires the import map (in each page <head>).

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const PALETTE = [0x5C9DFF,0x5BD6C6,0xF2A65A,0xB49BFF,0x7FD17F,0xFF8FA3,0xE8C45B,0x6FB7FF];

class Viewer {
  constructor(el){
    this.el = el;
    const frame = el.closest('.viewer-frame');
    this.status = frame ? frame.querySelector('.vstatus') : null;
    const w = el.clientWidth || 600, h = el.clientHeight || 460;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, w/h, 0.1, 50000);
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    this.renderer.setSize(w,h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    el.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xcfe0ff,0x141a22,1.0));
    const key=new THREE.DirectionalLight(0xffffff,1.2); key.position.set(1,1.4,1); this.scene.add(key);
    const rim=new THREE.DirectionalLight(0x5c9dff,0.5); rim.position.set(-1.2,0.4,-1); this.scene.add(rim);

    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.enableDamping=true; this.controls.dampingFactor=0.08;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.controls.autoRotate=!reduce; this.controls.autoRotateSpeed=2.0;
    this.controls.addEventListener('start',()=>{ this.controls.autoRotate=false; });

    this.current=null;
    window.addEventListener('resize',()=>this.resize());
    this._loop();
  }
  setStatus(t){ if(this.status) this.status.textContent=t; }
  resize(){ const w=this.el.clientWidth,h=this.el.clientHeight||460; this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h); }
  clear(){ if(this.current){ this.scene.remove(this.current); this.current.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material&&o.material.dispose)o.material.dispose(); }); this.current=null; } }
  frame(obj){
    const box=new THREE.Box3().setFromObject(obj);
    const sph=box.getBoundingSphere(new THREE.Sphere());
    obj.position.sub(sph.center);
    const r=sph.radius||1;
    this.camera.position.set(r*1.9, r*1.3, r*2.0);
    this.camera.near=Math.max(r/200,0.01); this.camera.far=r*200; this.camera.updateProjectionMatrix();
    this.controls.target.set(0,0,0); this.controls.update();
  }
  loadSTL(url){
    this.setStatus('Loading model…'); this.clear();
    new STLLoader().load(url, geo=>{
      geo.computeVertexNormals();
      const mesh=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:0xAEBED2,metalness:0.35,roughness:0.5}));
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,28), new THREE.LineBasicMaterial({color:0x5c9dff,transparent:true,opacity:0.16})));
      const grp=new THREE.Group(); grp.add(mesh); grp.rotation.x=-Math.PI/2; // CAD z-up
      this.scene.add(grp); this.current=grp; this.frame(grp); this.setStatus('');
    }, undefined, ()=>this.setStatus('Model not found — add the .stl and update data-src'));
  }
  loadOBJ(url, onParts){
    this.setStatus('Loading assembly…'); this.clear();
    new OBJLoader().load(url, obj=>{
      const parts=[]; let i=0;
      obj.traverse(ch=>{
        if(ch.isMesh){
          ch.geometry.computeVertexNormals();
          const color=PALETTE[i%PALETTE.length];
          ch.material=new THREE.MeshStandardMaterial({color, metalness:0.3, roughness:0.55});
          parts.push({mesh:ch, name:ch.name||`part_${i+1}`, color}); i++;
        }
      });
      this.scene.add(obj); this.current=obj; this.frame(obj); this.setStatus('');
      if(onParts) onParts(parts);
    }, undefined, ()=>this.setStatus('Assembly not found — export as .obj and update data-src'));
  }
  _loop(){ requestAnimationFrame(()=>this._loop()); this.controls.update(); this.renderer.render(this.scene,this.camera); }
}

// single STL viewers (not inside a switcher)
document.querySelectorAll('.stl-viewer').forEach(el=>{
  if(el.closest('.stl-switcher')) return;
  new Viewer(el).loadSTL(el.dataset.src);
});

// STL switchers (dropdown)
document.querySelectorAll('.stl-switcher').forEach(sw=>{
  const v=new Viewer(sw.querySelector('.stl-viewer'));
  const sel=sw.querySelector('select.model-select');
  const load=()=>v.loadSTL(sel.value);
  sel.addEventListener('change',load); load();
});

// OBJ assemblies with component toggles
document.querySelectorAll('.obj-viewer').forEach(el=>{
  const v=new Viewer(el);
  const legend=el.closest('.viewer-frame').querySelector('.components');
  v.loadOBJ(el.dataset.src, parts=>{
    if(!legend) return;
    legend.innerHTML='<div class="comp-head">Components</div>';
    parts.forEach(p=>{
      const row=document.createElement('label'); row.className='comp';
      const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=true;
      cb.addEventListener('change',()=>{ p.mesh.visible=cb.checked; });
      const dot=document.createElement('span'); dot.className='cdot'; dot.style.background='#'+p.color.toString(16).padStart(6,'0');
      const nm=document.createElement('span'); nm.className='cname'; nm.textContent=p.name;
      row.append(cb,dot,nm); legend.appendChild(row);
    });
  });
});
