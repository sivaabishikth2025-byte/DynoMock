"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export function TunnelBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.7);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      1.5,
      0.4,
      100
    );
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3.5; // Reduced from 7 for subtler effect
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Curve path data
    const curvePath = [
      -0.15439987182617188, -4.138374328613281, -3.073897361755371,
      -0.869240403175354, -5.335973739624023, -2.7324037551879883,
      -1.633371353149414, -5.862466812133789, -1.7560205459594727,
      -1.9328842163085938, -5.843876838684082, -1.1907804012298584,
      -2.15252685546875, -5.668161869049072, -0.644770622253418,
      -2.159583568572998, -5.050915241241455, -0.1310250163078308,
      -2.1433849334716797, -4.40407657623291, 0.3640003204345703,
      -2.451664924621582, -3.9286396503448486, 1.3159711360931396,
      -2.7058067321777344, -3.404994487762451, 2.207650661468506,
      -2.0846996307373047, -1.873553991317749, 2.309267044067383,
      -1.2601451873779297, -0.2743096351623535, 2.092146873474121,
      -1.0130963325500488, 0.8422636985778809, 2.544243574142456,
      -0.7751436233520508, 1.9591703414916992, 3.013312339782715,
      0.2966790795326233, 4.3367791175842285, 2.9735190868377686,
      1.3506059646606445, 4.95012092590332, 1.5352253913879395,
      0.9760977625846863, 3.2327873706817627, 0.8298614025115967,
      0.2991504669189453, 1.1627817153930664, 0.39388465881347656,
      0.5221062898635864, 0.7404534816741943, -0.3582862913608551,
      1.137399673461914, 1.2396659851074219, -1.0834779739379883,
      2.7765538692474365, 4.385804653167725, -1.5419139862060547,
      4.430294990539551, 7.450641632080078, -2.0930042266845703,
      5.475499153137207, 7.852602481842041, -3.6867828369140625,
      5.584137916564941, 6.385196685791016, -5.076840400695801,
      4.807437419891357, 3.7945828437805176, -5.751949310302734,
      3.6053285598754883, 1.381692886352539, -5.501461982727051,
      2.6468048095703125, 0.4823716878890991, -4.470411777496338,
      1.65478515625, -0.0785517692565918, -3.1033201217651367,
      0.6955953240394592, -1.3061118125915527, -2.337378740310669,
      0.034491539001464844, -2.9893672466278076, -2.4886598587036133,
      -0.0851704403758049, -3.677823543548584, -2.8274037837982178,
      -0.2470083236694336, -4.365466117858887, -3.0880308151245117,
    ];

    // Create curve points
    const points: THREE.Vector3[] = [];
    for (let p = 0; p < curvePath.length; p += 3) {
      points.push(
        new THREE.Vector3(curvePath[p], curvePath[p + 1], curvePath[p + 2])
      );
    }

    const spline = new THREE.CatmullRomCurve3(points);

    // Create tube geometry
    const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
    const vertices = tubeGeometry.attributes.position;

    // Create particles along the tube
    const pointGeometry = new THREE.SphereGeometry(0.01, 4, 4);
    const colors = [0x00ff88, 0x00ffff, 0x8844ff, 0xff44aa]; // Cyan, green, purple, pink

    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);
      const colorIndex = i % colors.length;
      const pointMaterial = new THREE.MeshBasicMaterial({
        color: colors[colorIndex],
      });
      const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
      pointMesh.position.set(x, y, z);
      scene.add(pointMesh);
    }

    // Create edge lines
    const edges = new THREE.EdgesGeometry(tubeGeometry, 0.35);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4499ff,
      transparent: true,
      opacity: 0.6,
    });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    scene.add(lineSegments);

    // Camera animation function
    function updateCamera(t: number) {
      const time = t * 0.12; // Faster animation speed
      const loopTime = 20 * 400;
      const p = (time % loopTime) / loopTime;
      const pos = tubeGeometry.parameters.path.getPointAt(p);
      const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.01) % 1);
      camera.position.copy(pos);
      camera.lookAt(lookAt);
    }

    // Animation loop
    function animate(t = 0) {
      animationRef.current = requestAnimationFrame(animate);
      updateCamera(t);
      composer.render();
    }

    animate();

    // Handle resize
    function handleResize() {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      composer.setSize(newW, newH);
    }

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ 
        opacity: 0.7,
        zIndex: 0,
      }}
    />
  );
}

