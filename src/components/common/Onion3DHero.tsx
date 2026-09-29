import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Onion3DHeroProps {
  onScanComplete?: () => void;
  interactive?: boolean;
}

export const Onion3DHero: React.FC<Onion3DHeroProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [activeScanning, setActiveScanning] = useState(true);
  const [detectedCount, setDetectedCount] = useState(18);
  const [scanMetric, setScanMetric] = useState({ grade: 'Grade A', oqi: 88.5, defect: '3.2%' });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Detect WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting: Warm agricultural studio illumination
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffecd2, 2.0);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x22c55e, 1.0); // Subtle leaf-green rim
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Group for the onion cluster
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    // Create realistic onion geometries
    const onionGeom = new THREE.SphereGeometry(0.75, 24, 24);
    // Taper top for onion neck morphology
    const posAttr = onionGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i);
      let x = posAttr.getX(i);
      let z = posAttr.getZ(i);
      if (y > 0) {
        const factor = 1 - (y / 0.75) * 0.45;
        posAttr.setX(i, x * factor);
        posAttr.setZ(i, z * factor);
      } else {
        // Flatten base slightly
        posAttr.setY(i, y * 0.85);
      }
    }
    onionGeom.computeVertexNormals();

    // Stem / Root geometry
    const stemGeom = new THREE.CylinderGeometry(0.06, 0.14, 0.4, 8);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.9,
    });

    // Onion materials (varied terracotta & copper-red)
    const onionMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0xc85a32, // Terracotta
        roughness: 0.45,
        metalness: 0.1,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xa04222, // Deep Copper Red
        roughness: 0.4,
        metalness: 0.12,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xd97736, // Golden Amber
        roughness: 0.5,
        metalness: 0.08,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x8b2500, // Rich Purple-Red
        roughness: 0.38,
        metalness: 0.15,
      }),
    ];

    // Inspection Grid Tray
    const gridHelper = new THREE.GridHelper(9, 18, 0x1b382b, 0xdad2c5);
    gridHelper.position.y = -0.65;
    scene.add(gridHelper);

    // Spawn 18 onions in an inspection tray cluster
    const onions: THREE.Group[] = [];
    const positions = [
      [0, 0, 0],
      [1.5, 0, 0.4],
      [-1.4, 0, -0.2],
      [0.6, 0, 1.4],
      [-0.8, 0, 1.2],
      [-1.8, 0, 1.5],
      [1.9, 0, -1.2],
      [0.2, 0, -1.6],
      [-1.1, 0, -1.7],
      [-2.3, 0, -0.4],
      [2.4, 0, 0.9],
      [-0.2, 0.8, 0.3], // Second layer
      [1.0, 0.8, -0.3],
      [-1.0, 0.8, 0.5],
      [0.4, 0.8, -0.9],
      [-0.6, 0.8, -0.8],
      [1.6, 0, 1.9],
      [-1.9, 0, -2.1],
    ];

    positions.forEach((pos, idx) => {
      const singleOnion = new THREE.Group();
      const mat = onionMaterials[idx % onionMaterials.length];
      const scale = 0.85 + (idx % 5) * 0.08;

      const bulb = new THREE.Mesh(onionGeom, mat);
      bulb.scale.set(scale, scale * 1.05, scale);
      bulb.castShadow = true;
      bulb.receiveShadow = true;
      singleOnion.add(bulb);

      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = scale * 0.8;
      stem.rotation.z = ((idx % 3) - 1) * 0.2;
      singleOnion.add(stem);

      // Defect ring / detection box indicator
      const ringGeom = new THREE.RingGeometry(scale * 0.85, scale * 0.92, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.55;
      singleOnion.add(ring);

      singleOnion.position.set(pos[0], pos[1], pos[2]);
      singleOnion.rotation.y = idx * 0.6;
      singleOnion.rotation.z = ((idx % 4) - 2) * 0.1;

      clusterGroup.add(singleOnion);
      onions.push(singleOnion);
    });

    // Laser Scanning Plane
    const scanPlaneGeom = new THREE.PlaneGeometry(9, 5);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeom, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scene.add(scanPlane);

    // Laser Beam Line
    const laserLineGeom = new THREE.CylinderGeometry(0.04, 0.04, 9, 8);
    const laserLineMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
    });
    const laserBeam = new THREE.Mesh(laserLineGeom, laserLineMat);
    laserBeam.rotation.z = Math.PI / 2;
    scene.add(laserBeam);

    // Animation & Mouse Interaction variables
    let animationFrameId: number;
    let scanDirection = 1;
    let scanZ = -3.5;
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !interactive) return;
      const deltaX = e.clientX - prevMouseX;
      targetRotationY += deltaX * 0.006;
      prevMouseX = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Render loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Scan plane motion
      scanZ += 0.035 * scanDirection;
      if (scanZ > 3.5) {
        scanDirection = -1;
      } else if (scanZ < -3.5) {
        scanDirection = 1;
      }

      scanPlane.position.z = scanZ;
      laserBeam.position.z = scanZ;
      laserBeam.position.y = 0.2;

      // Pulse scan light
      scanPlaneMat.opacity = 0.12 + Math.sin(elapsedTime * 6) * 0.06;

      // Highlight onions close to laser plane
      onions.forEach((onion) => {
        const ring = onion.children[2] as THREE.Mesh;
        const dist = Math.abs(onion.position.z + clusterGroup.position.z - scanZ);
        if (dist < 0.6) {
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.85;
          onion.position.y += Math.sin(elapsedTime * 4) * 0.003;
        } else {
          const currentOp = (ring.material as THREE.MeshBasicMaterial).opacity;
          (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, currentOp - 0.04);
        }
      });

      // Smooth damped rotation
      clusterGroup.rotation.y += (targetRotationY - clusterGroup.rotation.y) * 0.08;
      if (!isDragging) {
        targetRotationY += 0.002; // slow continuous showcase spin
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 600;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl bg-gradient-to-b from-[#182f23] via-[#14291f] to-[#0f1f17] overflow-hidden border border-[#2d4d3b] shadow-2xl flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Fallback for non-WebGL devices */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#14291f] p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-[#c85a32]/20 border border-[#c85a32] flex items-center justify-center mb-4 text-[#e87348] text-3xl font-bold">
            🧅
          </div>
          <h3 className="text-white text-lg font-semibold mb-1">Interactive 3D Preview (WebGL Fallback)</h3>
          <p className="text-neutral-300 text-sm max-w-sm">
            High-precision 3D scan engine running in accelerated 2D inspection canvas mode.
          </p>
        </div>
      )}

      {/* Overlay: Live Computer Vision Telemetry Hud */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-[#0d1c14]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#2d4d3b] text-xs font-mono text-[#a3e635]">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          <span>AI VISION PIPELINE ACTIVE</span>
          <span className="text-neutral-400">·</span>
          <span className="text-white">60 FPS</span>
        </div>
        <div className="bg-[#0d1c14]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-[#2d4d3b] text-xs text-neutral-300 flex flex-col gap-1">
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-neutral-400">Sample Detected:</span>
            <span className="text-white font-semibold tabular-nums">{detectedCount} Bulbs</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-neutral-400">Laser Sweep:</span>
            <span className="text-[#4ade80] font-semibold">Active LiDAR Scan</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-neutral-400">Orientation:</span>
            <span className="text-white">Multi-Angle Fusion</span>
          </div>
        </div>
      </div>

      {/* Overlay: Result Badge */}
      <div className="absolute bottom-4 right-4 pointer-events-none bg-[#0d1c14]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#2d4d3b] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 border border-[#22c55e] flex items-center justify-center font-bold text-[#4ade80] text-sm font-mono">
          A
        </div>
        <div className="flex flex-col text-left">
          <div className="text-xs text-neutral-400">Configured Quality Index</div>
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <span>OQI 88.5</span>
            <span className="text-xs font-normal text-[#86efac]">· Defect 3.2%</span>
          </div>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] text-neutral-400 font-mono hidden sm:block">
        Drag to rotate inspection tray 360°
      </div>
    </div>
  );
};
