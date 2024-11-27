import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as shader from "./Shaders/Shader";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default class Screen {
  constructor(selector) {
    this.areas = [
      { x: 0, y: -0.05, z: 0, r: 0.3, name: "Compression Latch" },
      { x: 0, y: -0.52, z: -0.02, r: 0.5, name: "Top Hinge" },
      { x: 0.38, y: -0.05, z: 0, r: 0.5, name: "Horizontal Rail" },
      { x: -0.38, y: -0.05, z: 0, r: 0.5, name: "Vertical Rail" },
      { x: 0, y: -0.05, z: 0.38, r: 0.5, name: "Pivot" },
    ];

    this.scene = new THREE.Scene();
    this.container = selector;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // make camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.time = 0;

    this.isPlaying = true;

    // set up outline
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.selectedObjects = [];
    this.outlinePass.edgeThickness = 4;
    this.outlinePass.edgeGlow = 2;
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.visibleEdgeColor.set(0x00ff00);
    this.outlinePass.hiddenEdgeColor.set(0x000000);
    this.composer.addPass(this.outlinePass);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // load bg
    const cubeTexture = new THREE.CubeTexture();
    const size = 256;
    const faces = ["px", "nx", "py", "ny", "pz", "nz"];
    faces.forEach((face) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, "#111111");
      gradient.addColorStop(1, "#111111");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      cubeTexture.images[faces.indexOf(face)] = canvas;
    });

    cubeTexture.needsUpdate = true;
    this.scene.environment = cubeTexture;
    this.scene.background = cubeTexture;

    // make light

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 5);
    this.scene.add(hemiLight);

    // const spotLight = new THREE.SpotLight(0xffffff, 0.4);
    // spotLight.position.set(0, 0, 8);
    // spotLight.castShadow = true;
    // this.scene.add(spotLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(0, 0, 8);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    const spotLight2 = new THREE.PointLight(0xffffff, 0.4);
    spotLight2.position.set(0, 0, -22);
    spotLight2.castShadow = true;
    this.scene.add(spotLight2);

    // load all parts
    this.metalShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform float time;
    varying vec3 vNormal;

    void main() {
      // Simple procedural noise-like pattern
      float noise = sin(dot(vNormal, vec3(1.0, 0.5, 0.0)) * 10.0 + time);
      float metalness = 0.5 + 0.5 * noise; // Oscillating metalness
      vec3 baseColor = mix(vec3(0.8, 0.8, 0.8), vec3(0.3, 0.3, 0.3), metalness);
      gl_FragColor = vec4(baseColor, 1.0);
    }
  `,
    });
    const loader = new GLTFLoader();
    loader.load("Models/untitled.glb", (geo) => {
      geo.scene.scale.set(2, 2, 2);
      const meshGroups = [];
      const meshByGroup = {};

      const traverse = (node, parent) => {
        if (node.isMesh) {
          parent.push(node);
        }
        for (const child of node.children) {
          traverse(child, parent);
        }
      };
      // traverse(geo.scene);
      for (const child in geo.scene.children) {
        console.log("child ", geo.scene.children[child]);
        meshGroups.push(geo.scene.children[child]);
        meshByGroup[geo.scene.children[child].name] = [];
        traverse(
          geo.scene.children[child],
          meshByGroup[geo.scene.children[child].name]
        );
      }

      console.log("meshByGroup ", meshByGroup);
      console.log("meshGroups ", meshGroups);

      this.meshToGroupIndex = {};
      for (let i = 0; i < meshGroups.length; i++) {
        for (let j = 0; j < meshByGroup[meshGroups[i].name].length; j++) {
          this.meshToGroupIndex[meshByGroup[meshGroups[i].name][j].uuid] = i;
        }
      }

      console.log("meshToGroupIndex ", this.meshToGroupIndex);

      for (const group in meshByGroup) {
        for (let i = 0; i < meshByGroup[group].length; i++) {
          meshByGroup[group][i].geometry.computeVertexNormals();
          meshByGroup[group][i].material = new THREE.MeshPhysicalMaterial({
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            metalness: 0.9,
            roughness: 0.5,
            color: meshByGroup[group][i].material.color,
            envMapIntensity: 1,
            emmissiveIntensity: 0.9,
            flatShading: false,
          });
          meshByGroup[group][i].castShadow = true;
          meshByGroup[group][i].receiveShadow = true;
        }
      }
      this.scene.add(geo.scene);
      this.meshGroups = meshGroups;
      this.meshByGroup = meshByGroup;

      // for (let i = 0; i < meshes.length; i++) {
      //   meshes[i].geometry.computeVertexNormals();
      //   meshes[i].material = new THREE.MeshPhysicalMaterial({
      //     clearcoat: 1,
      //     clearcoatRoughness: 0.1,
      //     metalness: 0.9,
      //     roughness: 0.5,
      //     color: meshes[i].material.color,
      //     envMapIntensity: 1,
      //     emmissiveIntensity: 0.9,
      //   });
      //   meshes[i].castShadow = true;
      //   meshes[i].receiveShadow = true;
      // }
      // this.scene.add(geo.scene);
      console.log("geo ", geo.scene);

      // raw data to thinsg
      const meshes = [];
      traverse(geo.scene, meshes);
      this.centerData = [];
      this.intersectables = [];
      for (let i = 0; i < meshes.length; i++) {
        const center = this.findCenterBox(meshes[i].geometry);
        this.centerData.push(center);
        this.intersectables.push(meshes[i]);
      }

      this.mousePos = new THREE.Vector2();
    });
    this.currentIntersect = null;
    this.currentIntersectNum = -1;

    this.enableSpheres = false;
    this.enableDetails = false;
    this.enableHighlight = false;

    this.resize();
    this.render();
    this.setupResize();

    this.sphereMeshes = [];
    this.addRings();
  }

  toggleEnableSpheres(bool) {
    this.enableSpheres = bool;
  }

  getSelectedSphere() {
    if (this.sphereSelected == -1) return null;
    return this.areas[this.sphereSelected];
  }

  getCurrentIntersect() {
    return this.currentIntersect;
  }

  getCurrentIntersectNum() {
    return this.currentIntersectNum;
  }

  getMeshList() {
    return this.meshGroups;
  }

  getMeshGroupOfHighlightedMesh() {
    if (this.currentIntersectNum == -1) return null;
    return this.meshGroups[
      this.meshToGroupIndex[this.currentIntersect.object.uuid]
    ];
  }

  updateSettings(settings) {
    this.enableSpheres = settings.enableSpheres;
    this.enableDetails = settings.detailedView;
    this.enableHighlight = settings.enablePartsHighlight;

    if (!settings.enableSpheres) {
      this.sphereMesh.material.opacity = 0;
      this.sphereMesh.position.set(1000, 0, 0);
    }
    if (!settings.enableHighlight) {
      this.outlinePass.selectedObjects = [];
    }
  }

  findCenterBox(geometry) {
    const position = geometry.attributes.position.array;
    const xpair = [position[0], position[0]];
    const ypair = [position[1], position[1]];
    const zpair = [position[2], position[2]];
    for (let i = 3; i < position.length; i += 3) {
      xpair[0] = Math.min(xpair[0], position[i]);
      xpair[1] = Math.max(xpair[1], position[i]);
      ypair[0] = Math.min(ypair[0], position[i + 1]);
      ypair[1] = Math.max(ypair[1], position[i + 1]);
      zpair[0] = Math.min(zpair[0], position[i + 2]);
      zpair[1] = Math.max(zpair[1], position[i + 2]);
    }
    // console.log(position, xpair, ypair, zpair);
    return new THREE.Vector3(
      (xpair[0] + xpair[1]) / 2,
      (ypair[0] + ypair[1]) / 2,
      (zpair[0] + zpair[1]) / 2
    );
  }

  // add glow effect to part
  panToPart(name) {
    if (!this.meshByGroup) return;
    if (!this.meshByGroup[name]) return;
    this.outlinePass.selectedObjects = [];
    for (let i = 0; i < this.meshByGroup[name].length; i++) {
      this.outlinePass.selectedObjects.push(this.meshByGroup[name][i]);
    }

    for (const group in this.meshByGroup) {
      if (group != name) {
        for (let i = 0; i < this.meshByGroup[group].length; i++) {
          this.meshByGroup[group][i].visible = false;
        }
      } else {
        for (let i = 0; i < this.meshByGroup[group].length; i++) {
          this.meshByGroup[group][i].visible = true;
        }
      }
    }
  }

  // part thats hovered add glow effect
  findPartClicked(event, boundingRect) {
    if (this.intersectables)
      for (let i = 0; i < this.intersectables.length; i++) {
        this.intersectables[i].visible = true;
      }

    if (!this.mousePos) return;

    const norm_x = (event.clientX / boundingRect.width) * 2 - 1;
    const norm_y = -(event.clientY / boundingRect.height) * 2 + 1;
    this.mousePos.x = norm_x;
    this.mousePos.y = norm_y;
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    this.outlinePass.selectedObjects = [];

    if (this.intersectables) {
      const intersects = this.raycaster.intersectObjects(this.intersectables);

      if (intersects.length > 0) {
        if (this.enableHighlight) {
          this.outlinePass.selectedObjects = [intersects[0].object];
        }
        this.currentIntersect = intersects[0];
        this.currentIntersectNum = this.intersectables.indexOf(
          intersects[0].object
        );
      } else {
        if (this.enableHighlight) {
          this.outlinePass.selectedObjects = [];
        }
        this.currentIntersect = null;
        this.currentIntersectNum = -1;
      }
    }

    // detect hover over spheres
    console.log("that ", this.sphereMesh);
    if (!this.sphereMesh || !this.enableSpheres) return;
    console.log("this");

    const origin = this.raycaster.ray.origin;
    const direction = this.raycaster.ray.direction;

    this.zDistMax = -1;

    this.sphereSelected = -1;
    for (let i = 0; i < this.areas.length; i++) {
      const v = new THREE.Vector3(
        this.areas[i].x - this.camera.position.x,
        this.areas[i].y - this.camera.position.y,
        this.areas[i].z - this.camera.position.z
      );
      const t = v.dot(direction);

      if (t < 0) {
        continue;
      }

      const closest = new THREE.Vector3()
        .copy(direction)
        .multiplyScalar(t)
        .add(origin);

      const dist = Math.sqrt(
        (closest.x - this.areas[i].x) ** 2 +
          (closest.y - this.areas[i].y) ** 2 +
          (closest.z - this.areas[i].z) ** 2
      );

      if (
        dist < this.areas[i].r &&
        (this.zDistMax == -1 || dist < this.zDistMax)
      ) {
        this.zDistMax = dist;
        this.sphereSelected = i;
        this.sphereMesh.material.opacity = 0.5;
        this.sphereMesh.geometry = new THREE.SphereGeometry(
          this.areas[i].r,
          64,
          64
        );
        this.sphereMesh.position.set(
          this.areas[i].x,
          this.areas[i].y,
          this.areas[i].z
        );
      }
    }

    if (this.zDistMax == -1) {
      this.sphereMesh.material.opacity = 0;
      this.sphereMesh.position.set(1000, 0, 0);
    }
  }

  addRings() {
    this.sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
    });
    this.sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 64, 64),
      this.sphereMaterial
    );
    this.sphereMesh.position.set(1000, 0, 0);
    this.sphereSelected = -1;
    this.scene.add(this.sphereMesh);
    return;
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.outlinePass.setSize(this.width, this.height);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    // console.log("Rendering...");
    // console.log(this.scene);
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.metalShaderMaterial.uniforms.time.value = this.time / 10;

    // this.lightgroup.position.set(
    //   this.camera.position.x + 6,
    //   this.camera.position.y + 2,
    //   this.camera.position.z + 10
    // );

    this.controls.update();
    requestAnimationFrame(this.render.bind(this));
    this.composer.render();
  }
}
