import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CinematicLogoScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- 2. DYNAMIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x2e1065, 2.4);
    scene.add(ambientLight);

    const sweepLight = new THREE.PointLight(0xffffff, 8, 25);
    sweepLight.position.set(-6, 4, 8);
    scene.add(sweepLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 5.5, 25);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x6366f1, 4.5, 25);
    cyanLight.position.set(-5, -4, 4);
    scene.add(cyanLight);

    // --- 3. 3D LOGO ASSEMBLY ---
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.45,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xc084fc,
      emissiveIntensity: 0.95,
      metalness: 0.2,
      roughness: 0.2,
    });

    const lavenderMaterial = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.75,
      metalness: 0.3,
      roughness: 0.2,
    });

    const extrudeSettings = {
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.12,
      bevelThickness: 0.15,
    };

    // A. Center Play Button
    const playShape = new THREE.Shape();
    const ps = 1.1;
    playShape.moveTo(-ps * 0.7, ps * 0.85);
    playShape.lineTo(ps * 1.05, 0);
    playShape.lineTo(-ps * 0.7, -ps * 0.85);
    playShape.closePath();

    const playGeo = new THREE.ExtrudeGeometry(playShape, {
      ...extrudeSettings,
      depth: 0.5,
    });
    playGeo.center();
    const playMesh = new THREE.Mesh(playGeo, glowMaterial);
    playMesh.position.set(0.1, -0.15, 0.1);
    logoGroup.add(playMesh);

    // B. Outer Play Loop
    const outerShape = new THREE.Shape();
    const w = 2.6, h = 2.4;
    outerShape.moveTo(-w * 0.8, h * 0.7);
    outerShape.quadraticCurveTo(-w * 0.9, -h * 0.8, -w * 0.3, -h * 0.95);
    outerShape.quadraticCurveTo(w * 0.7, -h * 0.85, w * 1.05, 0);
    outerShape.quadraticCurveTo(w * 0.9, h * 0.8, 0, h * 0.95);
    outerShape.quadraticCurveTo(-w * 0.7, h * 0.95, -w * 0.8, h * 0.7);

    const holePath = new THREE.Path();
    const hw = 1.8, hh = 1.7;
    holePath.moveTo(-hw * 0.7, hh * 0.6);
    holePath.quadraticCurveTo(-hw * 0.8, -hh * 0.7, -hw * 0.2, -hh * 0.8);
    holePath.quadraticCurveTo(hw * 0.6, -hh * 0.7, hw * 0.85, 0);
    holePath.quadraticCurveTo(hw * 0.7, hh * 0.7, 0, hh * 0.8);
    holePath.quadraticCurveTo(-hw * 0.6, hh * 0.8, -hw * 0.7, hh * 0.6);
    outerShape.holes.push(holePath);

    const outerGeo = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
    outerGeo.center();
    const outerMesh = new THREE.Mesh(outerGeo, bodyMaterial);
    outerMesh.position.set(0, -0.15, 0);
    logoGroup.add(outerMesh);

    // C. Dual Avatar Heads
    const headGeo = new THREE.SphereGeometry(0.58, 32, 32);

    const leftHead = new THREE.Mesh(headGeo, glowMaterial);
    leftHead.position.set(-1.25, 2.05, 0.2);
    logoGroup.add(leftHead);

    const rightHead = new THREE.Mesh(headGeo, lavenderMaterial);
    rightHead.position.set(1.05, 2.15, 0.1);
    logoGroup.add(rightHead);

    // D. Outer Glowing Halo Ring
    const haloGeo = new THREE.TorusGeometry(3.6, 0.04, 16, 100);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 0, -0.5);
    logoGroup.add(halo);

    // --- 4. SWIRLING PARTICLE ORBIT ---
    const particleCount = 1400;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xa855f7),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xc084fc),
      new THREE.Color(0x38bdf8),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * 0.8;
      particlePositions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- 5. INTERACTION & ANIMATION LOOP ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Mouse Parallax Lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Dynamic Floating & 3D Tilting
      logoGroup.position.y = Math.sin(t * 1.6) * 0.35;
      logoGroup.position.x = Math.cos(t * 0.8) * 0.15;
      
      logoGroup.rotation.y = Math.sin(t * 0.9) * 0.3 + mouse.x * 0.45;
      logoGroup.rotation.x = Math.cos(t * 1.2) * 0.12 - mouse.y * 0.35;
      logoGroup.rotation.z = Math.sin(t * 0.7) * 0.06;

      // Head Breathing Pulse
      const headPulse = 1 + Math.sin(t * 3.5) * 0.06;
      leftHead.scale.set(headPulse, headPulse, headPulse);
      rightHead.scale.set(headPulse, headPulse, headPulse);

      // Specular & Accent Lights
      sweepLight.position.x = Math.sin(t * 1.5) * 8;
      sweepLight.position.y = Math.cos(t * 1.1) * 6;
      sweepLight.position.z = 5 + Math.sin(t * 2) * 3;

      purpleLight.position.x = Math.cos(t * 1.2) * 6;
      purpleLight.position.y = Math.sin(t * 1.2) * 6;

      cyanLight.position.x = -Math.sin(t * 1.0) * 7;
      cyanLight.position.y = -Math.cos(t * 1.0) * 5;

      halo.rotation.z = t * 0.3;
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // --- 6. RESIZE OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
      }
    });

    resizeObserver.observe(container);

    // --- 7. CLEANUP ---
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      [playGeo, outerGeo, headGeo, haloGeo, particleGeometry].forEach((g) => g?.dispose());
      [bodyMaterial, glowMaterial, lavenderMaterial, haloMat, particleMaterial].forEach((m) => m?.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ overflow: "hidden", background: "#090514" }}
    />
  );
}