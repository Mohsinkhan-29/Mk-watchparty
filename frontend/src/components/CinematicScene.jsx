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

    // =========================================================
    // COLOR PALETTE
    // =========================================================

    const COLORS = {
      background: 0x010009,
      backgroundGlow: 0x2d0a48,
      deepViolet: 0x652faf,
      brandPurple: 0x9234d6,
      brightPurple: 0xc664ff,
      lavender: 0xc38cff,
    };

    // =========================================================
    // 1. SCENE & CAMERA
    // =========================================================

    const scene = new THREE.Scene();

    const width =
      container.clientWidth || window.innerWidth;

    const height =
      container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );

    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.25;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // =========================================================
    // 2. BACKGROUND
    // =========================================================

    scene.background = new THREE.Color(
      COLORS.background
    );

    // =========================================================
    // 3. LIGHTING
    // =========================================================

    const ambientLight =
      new THREE.AmbientLight(
        COLORS.backgroundGlow,
        2.8
      );

    scene.add(ambientLight);

    // Main white/purple reflection
    const keyLight =
      new THREE.PointLight(
        COLORS.brightPurple,
        9,
        30
      );

    keyLight.position.set(
      -5,
      5,
      8
    );

    scene.add(keyLight);

    // Main brand purple
    const purpleLight =
      new THREE.PointLight(
        COLORS.brandPurple,
        7,
        26
      );

    purpleLight.position.set(
      5,
      4,
      5
    );

    scene.add(purpleLight);

    // Deep violet shadow light
    const violetLight =
      new THREE.PointLight(
        COLORS.deepViolet,
        6,
        25
      );

    violetLight.position.set(
      -5,
      -4,
      4
    );

    scene.add(violetLight);

    // Back glow
    const rimLight =
      new THREE.PointLight(
        COLORS.lavender,
        4,
        20
      );

    rimLight.position.set(
      0,
      0,
      -5
    );

    scene.add(rimLight);

    // =========================================================
    // 4. LOGO GROUP
    // =========================================================

    const logoGroup =
      new THREE.Group();

    scene.add(logoGroup);

    const logoCore =
      new THREE.Group();

    logoGroup.add(logoCore);

    // =========================================================
    // 5. MATERIALS
    // =========================================================

    // Main logo body
    const bodyMaterial =
      new THREE.MeshPhysicalMaterial({
        color: COLORS.brandPurple,

        emissive: COLORS.deepViolet,

        emissiveIntensity: 0.38,

        metalness: 0.82,

        roughness: 0.16,

        clearcoat: 1,

        clearcoatRoughness: 0.08,
      });

    // Play triangle
    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: COLORS.brightPurple,

        emissive: COLORS.brightPurple,

        emissiveIntensity: 0.8,

        metalness: 0.22,

        roughness: 0.18,
      });

    // Avatar circles
    const lavenderMaterial =
      new THREE.MeshStandardMaterial({
        color: COLORS.lavender,

        emissive: COLORS.brandPurple,

        emissiveIntensity: 0.5,

        metalness: 0.25,

        roughness: 0.2,
      });

    // =========================================================
    // 6. LOGO EXTRUSION
    // =========================================================

    const extrudeSettings = {
      depth: 0.6,

      bevelEnabled: true,

      bevelSegments: 8,

      steps: 2,

      bevelSize: 0.12,

      bevelThickness: 0.15,
    };

    // =========================================================
    // 7. OUTER LOGO BODY
    // =========================================================

    const outerShape =
      new THREE.Shape();

    const w = 2.6;
    const h = 2.4;

    outerShape.moveTo(
      -w * 0.8,
      h * 0.7
    );

    outerShape.quadraticCurveTo(
      -w * 0.9,
      -h * 0.8,
      -w * 0.3,
      -h * 0.95
    );

    outerShape.quadraticCurveTo(
      w * 0.7,
      -h * 0.85,
      w * 1.05,
      0
    );

    outerShape.quadraticCurveTo(
      w * 0.9,
      h * 0.8,
      0,
      h * 0.95
    );

    outerShape.quadraticCurveTo(
      -w * 0.7,
      h * 0.95,
      -w * 0.8,
      h * 0.7
    );

    // Inner opening
    const holePath =
      new THREE.Path();

    const hw = 1.8;
    const hh = 1.7;

    holePath.moveTo(
      -hw * 0.7,
      hh * 0.6
    );

    holePath.quadraticCurveTo(
      -hw * 0.8,
      -hh * 0.7,
      -hw * 0.2,
      -hh * 0.8
    );

    holePath.quadraticCurveTo(
      hw * 0.6,
      -hh * 0.7,
      hw * 0.85,
      0
    );

    holePath.quadraticCurveTo(
      hw * 0.7,
      hh * 0.7,
      0,
      hh * 0.8
    );

    holePath.quadraticCurveTo(
      -hw * 0.6,
      hh * 0.8,
      -hw * 0.7,
      hh * 0.6
    );

    outerShape.holes.push(
      holePath
    );

    const outerGeo =
      new THREE.ExtrudeGeometry(
        outerShape,
        extrudeSettings
      );

    outerGeo.center();

    const outerMesh =
      new THREE.Mesh(
        outerGeo,
        bodyMaterial
      );

    outerMesh.position.set(
      0,
      -0.15,
      0
    );

    logoCore.add(
      outerMesh
    );

    // =========================================================
    // 8. PLAY BUTTON
    // =========================================================

    const playShape =
      new THREE.Shape();

    const ps = 1.1;

    playShape.moveTo(
      -ps * 0.7,
      ps * 0.85
    );

    playShape.lineTo(
      ps * 1.05,
      0
    );

    playShape.lineTo(
      -ps * 0.7,
      -ps * 0.85
    );

    playShape.closePath();

    const playGeo =
      new THREE.ExtrudeGeometry(
        playShape,
        {
          ...extrudeSettings,
          depth: 0.5,
        }
      );

    playGeo.center();

    const playMesh =
      new THREE.Mesh(
        playGeo,
        glowMaterial
      );

    playMesh.position.set(
      0.1,
      -0.15,
      0.15
    );

    logoCore.add(
      playMesh
    );

    // =========================================================
    // 9. AVATAR HEADS
    // =========================================================

    const headGeo =
      new THREE.SphereGeometry(
        0.58,
        32,
        32
      );

    const leftHead =
      new THREE.Mesh(
        headGeo,
        lavenderMaterial
      );

    const rightHead =
      new THREE.Mesh(
        headGeo,
        lavenderMaterial
      );

    const leftHeadTarget =
      new THREE.Vector3(
        -1.25,
        2.05,
        0.2
      );

    const rightHeadTarget =
      new THREE.Vector3(
        1.05,
        2.15,
        0.1
      );

    // Start outside the logo
    leftHead.position.set(
      -3.8,
      4.5,
      -2
    );

    rightHead.position.set(
      3.8,
      4.8,
      -2
    );

    logoCore.add(
      leftHead
    );

    logoCore.add(
      rightHead
    );

    // =========================================================
    // 10. SUBTLE HALO
    // =========================================================
    // Energy rings removed.
    // This is only a very subtle background halo.

    const haloGeo =
      new THREE.TorusGeometry(
        3.6,
        0.035,
        16,
        120
      );

    const haloMat =
      new THREE.MeshBasicMaterial({
        color: COLORS.brandPurple,

        transparent: true,

        opacity: 0,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,
      });

    const halo =
      new THREE.Mesh(
        haloGeo,
        haloMat
      );

    halo.position.set(
      0,
      0,
      -0.5
    );

    logoGroup.add(
      halo
    );

    // =========================================================
    // 11. PARTICLES
    // =========================================================

    const particleCount = 1600;

    const particlePositions =
      new Float32Array(
        particleCount * 3
      );

    const particleColors =
      new Float32Array(
        particleCount * 3
      );

    const particleData = [];

    const palette = [
      new THREE.Color(
        COLORS.brandPurple
      ),

      new THREE.Color(
        COLORS.brightPurple
      ),

      new THREE.Color(
        COLORS.lavender
      ),

      new THREE.Color(
        COLORS.deepViolet
      ),
    ];

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const i3 = i * 3;

      const radius =
        4 +
        Math.random() * 12;

      const angle =
        Math.random() *
        Math.PI *
        2;

      const verticalSpread =
        (Math.random() - 0.5) *
        3;

      const x =
        Math.cos(angle) *
        radius;

      const y =
        verticalSpread *
        (0.6 +
          Math.random() *
            0.6);

      const z =
        Math.sin(angle) *
        radius;

      particlePositions[i3] =
        x;

      particlePositions[
        i3 + 1
      ] = y;

      particlePositions[
        i3 + 2
      ] = z;

      const color =
        palette[
          Math.floor(
            Math.random() *
              palette.length
          )
        ];

      particleColors[i3] =
        color.r;

      particleColors[
        i3 + 1
      ] = color.g;

      particleColors[
        i3 + 2
      ] = color.b;

      particleData.push({
        angle,

        radius,

        speed:
          0.012 +
          Math.random() *
            0.035,

        yOffset: y,
      });
    }

    const particleGeometry =
      new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        particlePositions,
        3
      )
    );

    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        particleColors,
        3
      )
    );

    const particleMaterial =
      new THREE.PointsMaterial({
        size: 0.065,

        vertexColors: true,

        transparent: true,

        opacity: 0,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,
      });

    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial
      );

    scene.add(
      particles
    );

    // =========================================================
    // 12. BACKGROUND STARS
    // =========================================================

    const starCount = 500;

    const starPositions =
      new Float32Array(
        starCount * 3
      );

    for (
      let i = 0;
      i < starCount;
      i++
    ) {
      const i3 = i * 3;

      starPositions[i3] =
        (Math.random() - 0.5) *
        35;

      starPositions[
        i3 + 1
      ] =
        (Math.random() - 0.5) *
        20;

      starPositions[
        i3 + 2
      ] =
        -5 -
        Math.random() * 20;
    }

    const starGeometry =
      new THREE.BufferGeometry();

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        starPositions,
        3
      )
    );

    const starMaterial =
      new THREE.PointsMaterial({
        color: COLORS.deepViolet,

        size: 0.035,

        transparent: true,

        opacity: 0,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,
      });

    const stars =
      new THREE.Points(
        starGeometry,
        starMaterial
      );

    scene.add(stars);

    // =========================================================
    // 13. MOUSE PARALLAX
    // =========================================================

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove =
      (event) => {
        const rect =
          container.getBoundingClientRect();

        const x =
          (event.clientX -
            rect.left) /
          rect.width;

        const y =
          (event.clientY -
            rect.top) /
          rect.height;

        mouse.targetX =
          x * 2 - 1;

        mouse.targetY =
          -(y * 2 - 1);
      };

    container.addEventListener(
      "mousemove",
      handleMouseMove
    );

    // =========================================================
    // 14. INITIAL LOGO STATE
    // =========================================================

    // 4x larger final visual scale
    const LOGO_SCALE = 4;

    logoGroup.scale.setScalar(
      0.25
    );

    logoGroup.position.set(
      0,
      -0.8,
      0
    );

    logoCore.scale.setScalar(
      0.01
    );

    outerMesh.scale.set(
      0.01,
      0.01,
      0.01
    );

    playMesh.scale.set(
      0.01,
      0.01,
      0.01
    );

    leftHead.scale.setScalar(
      0.01
    );

    rightHead.scale.setScalar(
      0.01
    );

    halo.scale.setScalar(
      0.01
    );

    // =========================================================
    // 15. ANIMATION HELPERS
    // =========================================================

    const clamp01 = (value) =>
      Math.max(
        0,
        Math.min(1, value)
      );

    const easeOutCubic =
      (value) =>
        1 -
        Math.pow(
          1 -
            clamp01(value),
          3
        );

    const easeOutBack =
      (value) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        const x =
          clamp01(value);

        return (
          1 +
          c3 *
            Math.pow(
              x - 1,
              3
            ) +
          c1 *
            Math.pow(
              x - 1,
              2
            )
        );
      };

    const easeInOut =
      (value) => {
        const x =
          clamp01(value);

        return x < 0.5
          ? 2 * x * x
          : 1 -
              Math.pow(
                -2 * x + 2,
                2
              ) /
                2;
      };

    // =========================================================
    // 16. ANIMATION
    // =========================================================

    const clock =
      new THREE.Clock();

    let animationFrameId;

    const animate = () => {
      animationFrameId =
        requestAnimationFrame(
          animate
        );

      const t =
        clock.getElapsedTime();

      // -------------------------------------------------------
      // Mouse smoothing
      // -------------------------------------------------------

      mouse.x +=
        (mouse.targetX -
          mouse.x) *
        0.045;

      mouse.y +=
        (mouse.targetY -
          mouse.y) *
        0.045;

      // =======================================================
      // BACKGROUND FADE
      // =======================================================

      const starIntro =
        clamp01(t / 1.5);

      starMaterial.opacity =
        easeOutCubic(
          starIntro
        ) * 0.28;

      // =======================================================
      // PARTICLE FORMATION
      // =======================================================

      const particleIntro =
        clamp01(
          (t - 0.15) / 1.5
        );

      particleMaterial.opacity =
        easeOutCubic(
          particleIntro
        ) * 0.65;

      const particleScale =
        THREE.MathUtils.lerp(
          0.2,
          1,
          easeOutCubic(
            particleIntro
          )
        );

      particles.scale.setScalar(
        particleScale
      );

      // =======================================================
      // LOGO CORE FORMATION
      // =======================================================

      const coreProgress =
        clamp01(
          (t - 0.35) / 0.9
        );

      const coreEase =
        easeOutBack(
          coreProgress
        );

      logoCore.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          LOGO_SCALE,
          coreEase
        )
      );

      // =======================================================
      // OUTER BODY
      // =======================================================

      const bodyProgress =
        clamp01(
          (t - 0.4) / 0.65
        );

      const bodyEase =
        easeOutBack(
          bodyProgress
        );

      outerMesh.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          1,
          bodyEase
        )
      );

      // =======================================================
      // PLAY BUTTON
      // =======================================================

      const playProgress =
        clamp01(
          (t - 0.8) / 0.6
        );

      const playEase =
        easeOutBack(
          playProgress
        );

      playMesh.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          1,
          playEase
        )
      );

      if (
        playProgress < 1
      ) {
        playMesh.rotation.z =
          THREE.MathUtils.lerp(
            -0.35,
            0,
            playEase
          );
      }

      // =======================================================
      // AVATAR HEADS
      // =======================================================

      const headProgress =
        clamp01(
          (t - 1.05) / 0.7
        );

      const headEase =
        easeOutBack(
          headProgress
        );

      const leftStart =
        new THREE.Vector3(
          -3.8,
          4.5,
          -2
        );

      const rightStart =
        new THREE.Vector3(
          3.8,
          4.8,
          -2
        );

      leftHead.position.lerpVectors(
        leftStart,
        leftHeadTarget,
        headEase
      );

      rightHead.position.lerpVectors(
        rightStart,
        rightHeadTarget,
        headEase
      );

      leftHead.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          1,
          headEase
        )
      );

      rightHead.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          1,
          headEase
        )
      );

      // =======================================================
      // SUBTLE HALO
      // =======================================================

      const haloProgress =
        clamp01(
          (t - 1.25) / 0.75
        );

      const haloEase =
        easeOutCubic(
          haloProgress
        );

      halo.scale.setScalar(
        THREE.MathUtils.lerp(
          0.01,
          1,
          haloEase
        )
      );

      haloMat.opacity =
        haloEase * 0.3;

      // =======================================================
      // FINAL IDLE STATE
      // =======================================================

      const idleStart = 2.2;

      if (t > idleStart) {
        const breathe =
          1 +
          Math.sin(t * 1.8) *
            0.018;

        logoCore.scale.setScalar(
          LOGO_SCALE *
            breathe
        );

        // Very subtle floating
        logoGroup.position.y =
          Math.sin(t * 1.25) *
          0.12;

        logoGroup.position.x =
          Math.cos(t * 0.7) *
          0.04;

        // Mouse interaction
        logoGroup.rotation.y =
          Math.sin(t * 0.55) *
            0.06 +
          mouse.x * 0.18;

        logoGroup.rotation.x =
          Math.cos(t * 0.8) *
            0.025 -
          mouse.y * 0.12;

        logoGroup.rotation.z =
          Math.sin(t * 0.45) *
          0.015;

        // Head breathing
        const headPulse =
          1 +
          Math.sin(t * 2.8) *
            0.025;

        leftHead.scale.setScalar(
          headPulse
        );

        rightHead.scale.setScalar(
          headPulse
        );
      } else {
        const idleProgress =
          clamp01(
            (t - 1.7) / 0.5
          );

        const idleEase =
          easeInOut(
            idleProgress
          );

        logoGroup.position.y =
          THREE.MathUtils.lerp(
            -0.05,
            0,
            idleEase
          );

        logoGroup.rotation.y =
          mouse.x *
          0.12 *
          idleEase;

        logoGroup.rotation.x =
          -mouse.y *
          0.08 *
          idleEase;
      }

      // =======================================================
      // PARTICLE ORBIT
      // =======================================================

      const positionAttribute =
        particleGeometry
          .attributes.position;

      const positions =
        positionAttribute.array;

      for (
        let i = 0;
        i < particleCount;
        i++
      ) {
        const i3 = i * 3;

        const data =
          particleData[i];

        const angle =
          data.angle +
          t * data.speed;

        positions[i3] =
          Math.cos(angle) *
          data.radius;

        positions[
          i3 + 1
        ] =
          data.yOffset +
          Math.sin(
            t * 0.7 +
              data.angle * 2
          ) *
            0.08;

        positions[
          i3 + 2
        ] =
          Math.sin(angle) *
          data.radius;
      }

      positionAttribute.needsUpdate =
        true;

      particles.rotation.y =
        t * 0.012;

      particles.rotation.x =
        Math.sin(t * 0.15) *
        0.025;

      // =======================================================
      // HALO ROTATION
      // =======================================================

      halo.rotation.z =
        t * 0.1;

      halo.rotation.x =
        Math.sin(t * 0.2) *
        0.08;

      // =======================================================
      // LIGHT MOVEMENT
      // =======================================================

      keyLight.position.x =
        Math.sin(t * 0.7) *
        7;

      keyLight.position.y =
        Math.cos(t * 0.55) *
        5;

      keyLight.position.z =
        6 +
        Math.sin(t) *
        2;

      purpleLight.position.x =
        Math.cos(t * 0.65) *
        6;

      purpleLight.position.y =
        Math.sin(t * 0.8) *
        5;

      violetLight.position.x =
        -Math.sin(t * 0.55) *
        7;

      violetLight.position.y =
        -Math.cos(t * 0.5) *
        5;

      rimLight.position.z =
        -4 +
        Math.sin(t * 0.6);

      // =======================================================
      // CAMERA PARALLAX
      // =======================================================

      const cameraTargetX =
        mouse.x * 0.45;

      const cameraTargetY =
        mouse.y * 0.3;

      camera.position.x +=
        (cameraTargetX -
          camera.position.x) *
        0.025;

      camera.position.y +=
        (cameraTargetY -
          camera.position.y) *
        0.025;

      camera.lookAt(
        0,
        0,
        0
      );

      // =======================================================
      // RENDER
      // =======================================================

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // =========================================================
    // 17. RESIZE
    // =========================================================

    const resizeObserver =
      new ResizeObserver(
        (entries) => {
          for (const entry of entries) {
            const {
              width: newWidth,
              height: newHeight,
            } = entry.contentRect;

            if (
              newWidth > 0 &&
              newHeight > 0
            ) {
              camera.aspect =
                newWidth /
                newHeight;

              camera.updateProjectionMatrix();

              renderer.setSize(
                newWidth,
                newHeight
              );

              renderer.setPixelRatio(
                Math.min(
                  window.devicePixelRatio,
                  2
                )
              );
            }
          }
        }
      );

    resizeObserver.observe(
      container
    );

    // =========================================================
    // 18. CLEANUP
    // =========================================================

    return () => {
      container.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      resizeObserver.disconnect();

      cancelAnimationFrame(
        animationFrameId
      );

      if (
        renderer.domElement &&
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      outerGeo.dispose();
      playGeo.dispose();
      headGeo.dispose();
      haloGeo.dispose();
      particleGeometry.dispose();
      starGeometry.dispose();

      bodyMaterial.dispose();
      glowMaterial.dispose();
      lavenderMaterial.dispose();
      haloMat.dispose();
      particleMaterial.dispose();
      starMaterial.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        overflow: "hidden",
        background: "#010009",
      }}
    />
  );
}