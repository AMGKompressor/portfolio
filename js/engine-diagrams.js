/**
 * Animated engine diagrams — Enemy FSM, stealth perception, mission loop, noise radii.
 * Values reference Boxu/source/game.h and game.cpp constants.
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined") return;

  const FSM_STATES = [
    { key: "dormant", label: "Enemy is waiting. Nothing has woken him yet" },
    { key: "investigate", label: "Enemy heard a noise and is checking it out" },
    { key: "chase", label: "Enemy can see Suneku and is chasing" },
    { key: "search", label: "Suneku hid. Enemy is searching the area" },
  ];

  const MISSION_WIN = [
    { key: "playing", label: "Playing: find the keycard", edge: 0 },
    { key: "keycard", label: "Keycard collected. Head to the south exit", edge: 1 },
    { key: "extract", label: "Reach the south extraction zone to win", edge: 2 },
    { key: "won", label: "Mission complete!", edge: null },
  ];

  const MISSION_LOSE = [
    { key: "playing", label: "Playing: stay quiet and avoid Enemy", edge: 4 },
    { key: "caught", label: "Caught! Enemy reached Suneku", edge: 3 },
    { key: "lost", label: "Mission failed. Press R to try again", edge: 5 },
  ];

  function prepEdges(edges) {
    edges.forEach((edge) => {
      const len = edge.getTotalLength();
      gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
    });
  }

  function animateEdge(tl, edge, pause) {
    if (!edge) {
      tl.to({}, { duration: pause || 0.9 });
      return;
    }
    tl.to(edge, { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" });
    tl.to({}, { duration: pause || 0.5 });
    tl.set(edge, { strokeDashoffset: edge.getTotalLength() });
  }

  function initFsmDiagram(root) {
    const nodes = root.querySelectorAll(".fsm-node");
    const edges = root.querySelectorAll(".fsm-edge");
    const label = root.querySelector(".fsm-active-label");
    if (!nodes.length || !label) return;

    prepEdges(edges);

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    FSM_STATES.forEach((state, i) => {
      const node = root.querySelector('.fsm-node[data-state="' + state.key + '"]');
      const edge = edges[i];

      tl.call(() => {
        nodes.forEach((n) => n.classList.remove("is-active"));
        node?.classList.add("is-active");
        label.textContent = state.label;
      });

      tl.to({}, { duration: 0.15 });
      animateEdge(tl, edge, edge ? 0.55 : 1.1);
    });
  }

  function initMissionDiagram(root) {
    const nodes = root.querySelectorAll(".mission-node");
    const edges = root.querySelectorAll(".mission-edge");
    const label = root.querySelector(".mission-active-label");
    if (!nodes.length || !label) return;

    prepEdges(edges);

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.45 });

    function setState(key, text) {
      nodes.forEach((n) => n.classList.remove("is-active"));
      root.querySelector('.mission-node[data-state="' + key + '"]')?.classList.add("is-active");
      label.textContent = text;
    }

    MISSION_WIN.forEach((step) => {
      tl.call(() => setState(step.key, step.label));
      tl.to({}, { duration: 0.12 });
      animateEdge(tl, typeof step.edge === "number" ? edges[step.edge] : null, 0.45);
    });

    tl.call(() => setState("playing", "Press R to play again"));
    tl.to({}, { duration: 0.35 });

    MISSION_LOSE.forEach((step) => {
      tl.call(() => setState(step.key, step.label));
      tl.to({}, { duration: 0.12 });
      animateEdge(tl, typeof step.edge === "number" ? edges[step.edge] : null, 0.45);
    });
  }

  function initNoiseDiagram(root) {
    const walk = root.querySelector(".noise-ring--walk");
    const sprint = root.querySelector(".noise-ring--sprint");
    const hear = root.querySelector(".noise-ring--hear");
    const labelWalk = root.querySelector(".noise-label--walk");
    const labelSprint = root.querySelector(".noise-label--sprint");
    const labelHear = root.querySelector(".noise-label--hear");

    if (!walk || !sprint || !hear) return;

    gsap.set(walk, { attr: { r: 6 }, opacity: 0 });
    gsap.set(sprint, { attr: { r: 6 }, opacity: 0 });
    gsap.set(hear, { opacity: 0.35 });
    gsap.set([labelWalk, labelSprint], { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });

    tl.fromTo(
      walk,
      { attr: { r: 6 }, opacity: 0.9 },
      { attr: { r: 39 }, opacity: 0.15, duration: 1, ease: "power1.out" }
    )
      .fromTo(labelWalk, { opacity: 0 }, { opacity: 1, duration: 0.25 }, "<")
      .to(labelWalk, { opacity: 0, duration: 0.35 }, "-=0.25")
      .to({}, { duration: 0.25 })
      .fromTo(
        sprint,
        { attr: { r: 6 }, opacity: 0.9 },
        { attr: { r: 90 }, opacity: 0, duration: 1.2, ease: "power1.out" }
      )
      .fromTo(labelSprint, { opacity: 0 }, { opacity: 1, duration: 0.25 }, "<")
      .to(labelSprint, { opacity: 0, duration: 0.35 }, "-=0.25")
      .fromTo(hear, { opacity: 0.35 }, { opacity: 0.85, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" })
      .fromTo(labelHear, { opacity: 0.35 }, { opacity: 1, duration: 0.5 }, "<");
  }

  function initNoiseDemoDiagram(root) {
    const walk = root.querySelector(".noise-ring-walk");
    const sprint = root.querySelector(".noise-ring-sprint");
    const hear = root.querySelector(".noise-ring-hear");
    const hearWalk = root.querySelector(".noise-ring-hear-walk");
    const labelWalk = root.querySelector(".noise-panel__value--walk");
    const labelSprint = root.querySelector(".noise-panel__value--sprint");

    if (!walk || !sprint || !hear || !hearWalk || !labelWalk || !labelSprint) return;

    const hearRadius = 80;
    const hearWalkRadius = 36;
    const sprintRadius = 80;
    const walkRadius = 36;
    const hearDim = 0.16;
    const hearActive = 0.92;
    const pulseDuration = 0.65;
    const flashDuration = 0.16;
    const flashRepeat = 1;

    function setEnemyHearing(mode) {
      const isWalk = mode === "walk";
      const isSprint = mode === "sprint";

      gsap.set(hearWalk, { opacity: isWalk ? hearActive : hearDim });
      gsap.set(hear, { opacity: isSprint ? hearActive : hearDim });
      gsap.set(labelWalk, { opacity: isWalk ? 1 : 0 });
      gsap.set(labelSprint, { opacity: isSprint ? 1 : 0 });
    }

    gsap.set(walk, { attr: { r: 6 }, opacity: 0 });
    gsap.set(sprint, { attr: { r: 6 }, opacity: 0 });
    gsap.set(hearWalk, { attr: { r: hearWalkRadius }, opacity: hearDim });
    gsap.set(hear, { attr: { r: hearRadius }, opacity: hearDim });
    gsap.set(labelWalk, { opacity: 0 });
    gsap.set(labelSprint, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });

    tl.call(() => setEnemyHearing("walk"))
      .fromTo(
        walk,
        { attr: { r: 6 }, opacity: 0.92 },
        { attr: { r: walkRadius }, opacity: 0, duration: pulseDuration, ease: "power2.out" }
      )
      .fromTo(
        hearWalk,
        { opacity: hearActive },
        { opacity: 0.35, duration: flashDuration, yoyo: true, repeat: flashRepeat, ease: "sine.inOut" },
        "<"
      )
      .fromTo(
        labelWalk,
        { opacity: 1 },
        { opacity: 0.35, duration: flashDuration, yoyo: true, repeat: flashRepeat, ease: "sine.inOut" },
        "<"
      )
      .call(() => setEnemyHearing("sprint"))
      .fromTo(
        sprint,
        { attr: { r: 6 }, opacity: 0.92 },
        { attr: { r: sprintRadius }, opacity: 0, duration: pulseDuration, ease: "power2.out" }
      )
      .fromTo(
        hear,
        { opacity: hearActive },
        { opacity: 0.35, duration: flashDuration, yoyo: true, repeat: flashRepeat, ease: "sine.inOut" },
        "<"
      )
      .fromTo(
        labelSprint,
        { opacity: 1 },
        { opacity: 0.35, duration: flashDuration, yoyo: true, repeat: flashRepeat, ease: "sine.inOut" },
        "<"
      );
  }

  const VISION_DEMO_PLAYER = { x: 338, y: 118 };
  const VISION_DEMO_BEAM_RANGE = 118;
  const VISION_DEMO_WALLS = [
    { x1: 282, y1: 36, x2: 540, y2: 36 },
    { x1: 282, y1: 36, x2: 296, y2: 121 },
  ];
  const VISION_DEMO_PEEK_HINT = { x: 221, y: 135 };

  function segmentSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 1e-6) {
      return false;
    }
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua > 1e-4 && ua < 1.0 - 1e-4 && ub > 1e-4 && ub < 1.0 - 1e-4;
  }

  function rayBlockedByWalls(origin, target, walls) {
    for (let w = 0; w < walls.length; w++) {
      const wall = walls[w];
      if (
        segmentSegmentsIntersect(
          origin.x,
          origin.y,
          target.x,
          target.y,
          wall.x1,
          wall.y1,
          wall.x2,
          wall.y2
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /** 0–1 visibility at target, feathered like vision_mask.frag (not a hard in/out). */
  function visionDemoPointVisibility(origin, aimDeg, halfAngleDeg, maxRange, walls, target) {
    if (rayBlockedByWalls(origin, target, walls)) {
      return 0;
    }

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) {
      return 0;
    }

    const targetAng = (Math.atan2(dy, dx) * 180) / Math.PI;
    const angDelta = Math.abs(shortestAngleDeltaDegrees(aimDeg, targetAng));
    const featherDeg = 4;
    const rangeScale = maxRange / 460;
    const darkAng = smoothstep(
      halfAngleDeg - featherDeg,
      halfAngleDeg + featherDeg * 0.35,
      angDelta
    );

    const targetRad = (targetAng * Math.PI) / 180;
    const rangeAlongRay = rayRangeToWalls(
      origin.x,
      origin.y,
      Math.cos(targetRad),
      Math.sin(targetRad),
      maxRange,
      walls
    );
    const rangeFeather = Math.max(featherDeg * 2.5 * rangeScale, 24 * rangeScale);
    const darkRange = smoothstep(
      rangeAlongRay - rangeFeather,
      rangeAlongRay + rangeFeather * 0.25,
      len
    );

    const dark = Math.max(darkAng, darkRange);
    if (dark >= 0.98) {
      return 0;
    }
    return 1 - dark;
  }

  function raySegmentHit(px, py, dirX, dirY, x1, y1, x2, y2) {
    const segDx = x2 - x1;
    const segDy = y2 - y1;
    const denom = dirX * segDy - dirY * segDx;
    if (Math.abs(denom) < 1e-6) {
      return null;
    }
    const t = ((x1 - px) * segDy - (y1 - py) * segDx) / denom;
    const u = ((x1 - px) * dirY - (y1 - py) * dirX) / denom;
    if (t > 1e-4 && u >= 0 && u <= 1) {
      return t;
    }
    return null;
  }

  function rayRangeToWalls(px, py, dirX, dirY, maxRange, walls) {
    let minT = maxRange;
    for (let w = 0; w < walls.length; w++) {
      const wall = walls[w];
      const t = raySegmentHit(px, py, dirX, dirY, wall.x1, wall.y1, wall.x2, wall.y2);
      if (t !== null) {
        minT = Math.min(minT, t);
      }
    }
    return Math.max(0, Math.min(minT, maxRange));
  }

  /** Shortest unobstructed ray in wedge — used for status text only. */
  function visionBeamMinRange(aimDeg, halfAngleDeg, maxRange, origin, walls, steps) {
    const sampleSteps = steps || 24;
    let minR = maxRange;
    for (let i = 0; i <= sampleSteps; i++) {
      const worldAng = aimDeg - halfAngleDeg + (2 * halfAngleDeg * i) / sampleSteps;
      const rad = (worldAng * Math.PI) / 180;
      const range = rayRangeToWalls(
        origin.x,
        origin.y,
        Math.cos(rad),
        Math.sin(rad),
        maxRange,
        walls
      );
      minR = Math.min(minR, range);
    }
    return minR;
  }

  /** Lit wedge polygon: each boundary ray clipped independently (matches vision_mask.frag). */
  function visionBeamPathOccluded(halfAngleDeg, maxRange, aimDeg, origin, walls, steps) {
    const sampleSteps = steps || 36;
    const rotation = visionFacingRotation(aimDeg);
    let d = "M 0 0";

    for (let i = 0; i <= sampleSteps; i++) {
      const worldAng = aimDeg - halfAngleDeg + (2 * halfAngleDeg * i) / sampleSteps;
      const worldRad = (worldAng * Math.PI) / 180;
      const range = rayRangeToWalls(
        origin.x,
        origin.y,
        Math.cos(worldRad),
        Math.sin(worldRad),
        maxRange,
        walls
      );
      const localAng = ((worldAng - rotation) * Math.PI) / 180;
      const x = Math.cos(localAng) * range;
      const y = Math.sin(localAng) * range;
      d += " L " + x + " " + y;
    }

    d += " Z";
    return d;
  }

  /** Local forward in diagram space: wedge built pointing up (-90° world = 0° group rotation). */
  const VISION_DEMO_LOCAL_AIM = -90;

  function visionFacingRotation(aimDeg) {
    return aimDeg - VISION_DEMO_LOCAL_AIM;
  }

  function shortestAngleDeltaDegrees(fromDeg, toDeg) {
    return ((toDeg - fromDeg + 540) % 360) - 180;
  }

  function turnFacingTowardMouse(currentDeg, targetDeg, maxStepDeg) {
    const delta = shortestAngleDeltaDegrees(currentDeg, targetDeg);
    if (Math.abs(delta) <= maxStepDeg || Math.abs(delta) <= 1.25) {
      return targetDeg;
    }
    return currentDeg + (delta > 0 ? maxStepDeg : -maxStepDeg);
  }

  function visionDemoSvgPoint(svg, clientX, clientY) {
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    return pt.matrixTransform(matrix.inverse());
  }

  function visionDemoTargetAim(point) {
    const dx = point.x - VISION_DEMO_PLAYER.x;
    const dy = point.y - VISION_DEMO_PLAYER.y;
    if (dx * dx + dy * dy < 4) {
      return null;
    }
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  function applyVisionDemoFrame(root, aimDeg, mousePoint) {
    const halfAngle = 22;
    const beamRange = VISION_DEMO_BEAM_RANGE;

    const maskBeam = root.querySelector(".vision-mask-beam");
    const peekMaskBeam = root.querySelector(".vision-peek-mask-beam");
    const peekMaskRotate = root.querySelector(".vision-peek-mask-rotate");
    const facing = root.querySelector(".vision-facing");
    const maskRotate = root.querySelector(".vision-mask-rotate");
    const mouseDot = root.querySelector(".vision-mouse-dot");
    const peekHint = root.querySelector(".vision-peek-hint");

    const wedgePath = visionBeamPathOccluded(
      halfAngle,
      beamRange,
      aimDeg,
      VISION_DEMO_PLAYER,
      VISION_DEMO_WALLS
    );
    const rotation = visionFacingRotation(aimDeg);

    if (maskBeam) maskBeam.setAttribute("d", wedgePath);
    if (peekMaskBeam) peekMaskBeam.setAttribute("d", wedgePath);

    const rotProps = {
      svgOrigin: "0 0",
      transformOrigin: "0px 0px",
      rotation: rotation,
    };
    if (facing) gsap.set(facing, rotProps);
    if (maskRotate) gsap.set(maskRotate, rotProps);
    if (peekMaskRotate) gsap.set(peekMaskRotate, rotProps);

    if (mouseDot && mousePoint) {
      mouseDot.setAttribute("cx", String(mousePoint.x));
      mouseDot.setAttribute("cy", String(mousePoint.y));
      mouseDot.setAttribute("opacity", "1");
    } else if (mouseDot) {
      mouseDot.setAttribute("opacity", "0");
    }

    if (peekHint) {
      const visibility = visionDemoPointVisibility(
        VISION_DEMO_PLAYER,
        aimDeg,
        halfAngle,
        beamRange,
        VISION_DEMO_WALLS,
        VISION_DEMO_PEEK_HINT
      );
      const fillOpacity = visibility < 0.04 ? 0 : Math.max(0.75, visibility);
      peekHint.setAttribute("fill-opacity", String(fillOpacity));
    }

    return visionBeamMinRange(aimDeg, halfAngle, beamRange, VISION_DEMO_PLAYER, VISION_DEMO_WALLS);
  }

  function initVisionDemoDiagram(root, options) {
    const interactive = !(options && options.reducedMotion);
    const svg = root.querySelector(".engine-diagram__svg");
    const status = root.querySelector(".vision-status");
    let currentAim = -90;
    let targetAim = -90;
    let mousePoint = null;
    let lastTick = performance.now();
    let rafId = 0;

    function updateStatus(minRange, maxRange) {
      if (!status) return;
      if (!mousePoint) {
        status.textContent = "Move your mouse here to aim. Most of the room stays dark until you look at it";
        return;
      }
      if (minRange < maxRange - 2) {
        status.textContent = "The wall blocks part of your view. Only the clear slice stays lit";
      } else {
        status.textContent = "The lit wedge shows what Suneku can see right now";
      }
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;
      if (mousePoint) {
        targetAim = visionDemoTargetAim(mousePoint) ?? targetAim;
      }
      currentAim = turnFacingTowardMouse(currentAim, targetAim, 220 * dt);
      const minRange = applyVisionDemoFrame(root, currentAim, mousePoint);
      updateStatus(minRange, VISION_DEMO_BEAM_RANGE);
      rafId = requestAnimationFrame(tick);
    }

    function onPointerMove(event) {
      const point = visionDemoSvgPoint(svg, event.clientX, event.clientY);
      if (!point) return;
      mousePoint = point;
      if (options && options.reducedMotion) {
        const aim = visionDemoTargetAim(point);
        if (aim !== null) {
          currentAim = aim;
          targetAim = aim;
          applyVisionDemoFrame(root, currentAim, mousePoint);
          updateStatus(
            visionBeamMinRange(currentAim, 22, VISION_DEMO_BEAM_RANGE, VISION_DEMO_PLAYER, VISION_DEMO_WALLS),
            VISION_DEMO_BEAM_RANGE
          );
        }
      }
    }

    function onPointerLeave() {
      mousePoint = null;
      const minRange = applyVisionDemoFrame(root, currentAim, null);
      updateStatus(minRange, VISION_DEMO_BEAM_RANGE);
    }

    applyVisionDemoFrame(root, currentAim, null);
    updateStatus(
      visionBeamMinRange(currentAim, 22, VISION_DEMO_BEAM_RANGE, VISION_DEMO_PLAYER, VISION_DEMO_WALLS),
      VISION_DEMO_BEAM_RANGE
    );

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    if (interactive) {
      rafId = requestAnimationFrame(tick);
    }

    return function cleanupVisionDemo() {
      cancelAnimationFrame(rafId);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }

  function initObbDemoDiagram(root) {
    const actor = root.querySelector(".obb-actor");
    const status = root.querySelector(".obb-status");

    if (!actor) return;

    const wallX = 520;
    const hullHalfW = 14;
    const slideNear = { x: wallX - hullHalfW, y: 155 };
    const slideFar = { x: 350, y: 155 };

    gsap.set(actor, { x: slideFar.x, y: slideFar.y, transformOrigin: "0px 0px" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

    tl.call(() => {
      if (status) status.textContent = "Suneku walks toward the wall…";
    })
      .to(actor, { x: slideNear.x, duration: 1.4, ease: "power1.inOut" })
      .call(() => {
        if (status) status.textContent = "Touching the wall, sliding along it without clipping through";
      })
      .to({}, { duration: 0.35 })
      .to(actor, { y: 195, duration: 0.9, ease: "power1.inOut" })
      .to(actor, { y: 115, duration: 0.9, ease: "power1.inOut" })
      .call(() => {
        if (status) status.textContent = "Red box = hitbox aligned to the character when sliding on walls";
      })
      .to(actor, { x: slideFar.x, y: 155, duration: 1.1, ease: "power1.inOut" });
  }

  function initPerceptionDiagram(root) {
    const vision = root.querySelector(".perception-vision");
    const noise = root.querySelector(".perception-noise");
    const hearing = root.querySelector(".perception-hearing");
    const player = root.querySelector(".perception-player");

    const sunekuFar = { x: 178, y: 168 };
    const sunekuNear = { x: 148, y: 138 };
    const visionAway = 215;
    const visionAtPlayer = 36;

    gsap.set(vision, { svgOrigin: "0 0", transformOrigin: "0px 0px", rotation: visionAway });
    gsap.set(player, { x: sunekuFar.x, y: sunekuFar.y });
    gsap.set(noise, { attr: { r: 8 }, opacity: 0 });
    if (hearing) gsap.set(hearing, { opacity: 0.35 });

    const master = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

    master
      .to({}, { duration: 0.45 })
      .to(player, {
        x: sunekuNear.x,
        y: sunekuNear.y,
        duration: 1.8,
        ease: "power1.inOut",
      })
      .fromTo(
        noise,
        { attr: { r: 8 }, opacity: 0.85 },
        { attr: { r: 46 }, opacity: 0, duration: 1.1, ease: "power1.out" },
        "-=0.15"
      );

    if (hearing) {
      master.fromTo(
        hearing,
        { opacity: 0.35 },
        { opacity: 1, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" },
        "-=1.05"
      );
    }

    master
      .to(vision, { rotation: visionAtPlayer, duration: 0.55, ease: "power2.out" })
      .to({}, { duration: 0.35 })
      .to(player, {
        x: sunekuFar.x,
        y: sunekuFar.y,
        duration: 1.5,
        ease: "power1.inOut",
      })
      .to(vision, { rotation: visionAway, duration: 0.55, ease: "power2.inOut" })
      .to({}, { duration: 0.35 });
  }

  function initReducedMotion() {
    const cleanups = [];
    const fsmRoot = document.getElementById("diagram-fsm");
    const perceptionRoot = document.getElementById("diagram-perception");
    const missionRoot = document.getElementById("diagram-mission");
    const noiseRoot = document.getElementById("diagram-noise");

    if (fsmRoot) {
      fsmRoot.querySelectorAll(".fsm-node").forEach((n) => n.classList.remove("is-active"));
      fsmRoot.querySelector('.fsm-node[data-state="chase"]')?.classList.add("is-active");
      const label = fsmRoot.querySelector(".fsm-active-label");
      if (label) label.textContent = "Enemy spotted Suneku. Chase!";
      fsmRoot.querySelectorAll(".fsm-edge").forEach((e) => gsap.set(e, { strokeDashoffset: 0 }));
    }

    if (perceptionRoot) {
      gsap.set(perceptionRoot.querySelector(".perception-player"), { x: 148, y: 138 });
      gsap.set(perceptionRoot.querySelector(".perception-noise"), {
        attr: { r: 32 },
        opacity: 0.45,
      });
      gsap.set(perceptionRoot.querySelector(".perception-vision"), {
        svgOrigin: "0 0",
        transformOrigin: "0px 0px",
        rotation: 36,
      });
    }

    if (missionRoot) {
      missionRoot.querySelectorAll(".mission-node").forEach((n) => n.classList.remove("is-active"));
      missionRoot.querySelector('.mission-node[data-state="extract"]')?.classList.add("is-active");
      const label = missionRoot.querySelector(".mission-active-label");
      if (label) label.textContent = "Reach the south exit to win";
      missionRoot.querySelectorAll(".mission-edge").forEach((e) => gsap.set(e, { strokeDashoffset: 0 }));
    }

    if (noiseRoot) {
      gsap.set(noiseRoot.querySelector(".noise-ring--walk"), { attr: { r: 39 }, opacity: 0.35 });
      gsap.set(noiseRoot.querySelector(".noise-ring--sprint"), { attr: { r: 90 }, opacity: 0.2 });
    }

    const visionDemo = document.getElementById("diagram-vision-demo");
    if (visionDemo) {
      cleanups.push(initVisionDemoDiagram(visionDemo, { reducedMotion: true }));
    }

    const obbDemo = document.getElementById("diagram-obb-demo");
    if (obbDemo) {
      gsap.set(obbDemo.querySelector(".obb-actor"), { x: 506, y: 155 });
    }

    const noiseDemo = document.getElementById("diagram-noise-demo");
    if (noiseDemo) {
      gsap.set(noiseDemo.querySelector(".noise-ring-walk"), { attr: { r: 6 }, opacity: 0 });
      gsap.set(noiseDemo.querySelector(".noise-ring-sprint"), { attr: { r: 6 }, opacity: 0 });
      gsap.set(noiseDemo.querySelector(".noise-ring-hear-walk"), { attr: { r: 36 }, opacity: 0.45 });
      gsap.set(noiseDemo.querySelector(".noise-ring-hear"), { attr: { r: 80 }, opacity: 0.16 });
      gsap.set(noiseDemo.querySelector(".noise-panel__value--walk"), { opacity: 1 });
      gsap.set(noiseDemo.querySelector(".noise-panel__value--sprint"), { opacity: 0 });
    }

    return function revertReducedMotion() {
      cleanups.forEach(function (fn) {
        fn();
      });
    };
  }

  function initAllDiagrams() {
    const cleanups = [];
    const fsmRoot = document.getElementById("diagram-fsm");
    const perceptionRoot = document.getElementById("diagram-perception");
    const missionRoot = document.getElementById("diagram-mission");
    const noiseRoot = document.getElementById("diagram-noise");
    const visionDemo = document.getElementById("diagram-vision-demo");
    const obbDemo = document.getElementById("diagram-obb-demo");
    const noiseDemo = document.getElementById("diagram-noise-demo");

    if (fsmRoot) initFsmDiagram(fsmRoot);
    if (perceptionRoot) initPerceptionDiagram(perceptionRoot);
    if (missionRoot) initMissionDiagram(missionRoot);
    if (noiseRoot) initNoiseDiagram(noiseRoot);
    if (visionDemo) cleanups.push(initVisionDemoDiagram(visionDemo));
    if (obbDemo) initObbDemoDiagram(obbDemo);
    if (noiseDemo) initNoiseDemoDiagram(noiseDemo);

    return function revertAllDiagrams() {
      cleanups.forEach(function (fn) {
        fn();
      });
    };
  }

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    const revert = initReducedMotion();
    return revert;
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    let revertDiagrams = null;
    const ctx = gsap.context(function () {
      revertDiagrams = initAllDiagrams();
    });
    return function () {
      if (revertDiagrams) revertDiagrams();
      ctx.revert();
    };
  });
})();
