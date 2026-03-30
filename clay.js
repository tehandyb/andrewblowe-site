(function () {
  // ── Config ──────────────────────────────────────────────────────────────
  const PROFILE_N  = 72;    // number of points defining the silhouette
  const LATHE_SEGS = 80;    // radial segments (smoothness of rotation)
  const H          = 0.85;  // half-height of clay
  const BASE_R     = 0.48;  // starting max radius
  const BRUSH_H    = 0.18;  // vertical influence radius of tool
  const BRUSH_STR  = 0.003; // deformation strength per frame at brush center
  const SPIN_SPEED = 0.7;   // radians / second

  // ── State ────────────────────────────────────────────────────────────────
  let mode        = 'carve'; // 'carve' | 'expand'
  let pressing    = false;
  let toolY       = 0;
  let toolApproach = 0;      // 0 = resting away, 1 = pressed in
  let profile     = [];
  let needsBuild  = false;

  // ── Three.js objects ─────────────────────────────────────────────────────
  let scene, camera, renderer;
  let clayMesh, toolGroup, toolTip;
  let spinGroup; // clay + wheel base — rotates together

  // ── Profile helpers ───────────────────────────────────────────────────────

  function initProfile() {
    profile = [];
    for (let i = 0; i < PROFILE_N; i++) {
      const t = i / (PROFILE_N - 1);
      const y = (t - 0.5) * 2 * H;
      // Sphere silhouette: r = sqrt(1 - (y/H)^2) * BASE_R
      const r = Math.sqrt(Math.max(0, 1 - (y / H) ** 2)) * BASE_R;
      profile.push(new THREE.Vector2(r, y));
    }
  }

  // Interpolate radius at arbitrary y (for tool positioning)
  function radiusAt(y) {
    for (let i = 0; i < PROFILE_N - 1; i++) {
      if (profile[i].y <= y && profile[i + 1].y >= y) {
        const t = (y - profile[i].y) / (profile[i + 1].y - profile[i].y);
        return profile[i].x + t * (profile[i + 1].x - profile[i].x);
      }
    }
    return 0;
  }

  function buildGeometry() {
    const geo = new THREE.LatheGeometry(profile, LATHE_SEGS);
    geo.computeVertexNormals();
    if (clayMesh.geometry) clayMesh.geometry.dispose();
    clayMesh.geometry = geo;
    needsBuild = false;
  }

  // Push profile inward (carve) or outward (expand) near toolY
  function deform() {
    const dir = mode === 'carve' ? -1 : 1;
    let changed = false;
    for (let i = 1; i < PROFILE_N - 1; i++) { // skip poles (i=0, i=N-1)
      const dy = Math.abs(profile[i].y - toolY);
      if (dy < BRUSH_H) {
        const falloff = (1 - dy / BRUSH_H) ** 2; // smooth quadratic falloff
        const delta   = dir * BRUSH_STR * falloff;
        const next    = Math.max(0.01, Math.min(BASE_R * 2.2, profile[i].x + delta));
        if (next !== profile[i].x) { profile[i].x = next; changed = true; }
      }
    }
    if (changed) needsBuild = true;
  }

  // Weighted 5-point smooth — run multiple passes
  function smoothProfile() {
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 2; i < PROFILE_N - 2; i++) {
        profile[i].x =
          profile[i - 2].x * 0.10 +
          profile[i - 1].x * 0.25 +
          profile[i].x     * 0.30 +
          profile[i + 1].x * 0.25 +
          profile[i + 2].x * 0.10;
      }
    }
    buildGeometry();
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('.clay-btn[data-mode]').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === m)
    );
    if (toolTip) {
      toolTip.material.color.setHex(m === 'carve' ? 0xdd9977 : 0x88aacc);
    }
  }

  // ── Scene setup ───────────────────────────────────────────────────────────

  function initScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f1117);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1117, 0.16);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
    camera.position.set(1.9, 0.7, 2.3);
    camera.lookAt(0, 0, 0);

    // Lights: warm key + cool fill + rim
    scene.add(new THREE.AmbientLight(0x334466, 0.8));

    const key = new THREE.DirectionalLight(0xfff0e0, 2.8);
    key.position.set(3, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far  = 15;
    key.shadow.camera.left = key.shadow.camera.bottom = -3;
    key.shadow.camera.right = key.shadow.camera.top   =  3;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x6699bb, 0.5);
    fill.position.set(-3, 2, -1);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xff8855, 0.25);
    rim.position.set(0, -3, -3);
    scene.add(rim);

    // Spin group: clay + wheel base
    spinGroup = new THREE.Group();
    scene.add(spinGroup);

    const clayMat = new THREE.MeshStandardMaterial({
      color: 0xba7d56,
      roughness: 0.88,
      metalness: 0.0,
    });
    clayMesh = new THREE.Mesh(new THREE.BufferGeometry(), clayMat);
    clayMesh.castShadow = true;
    clayMesh.receiveShadow = true;
    spinGroup.add(clayMesh);

    // Wooden wheel disc
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.055, 48);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x241810, roughness: 0.95 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.y = -H - 0.027;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    spinGroup.add(wheel);

    // Ground circle
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4, 48),
      new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 1.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -H - 0.057;
    ground.receiveShadow = true;
    scene.add(ground);

    // Tool (world-space — does NOT spin with clay)
    toolGroup = new THREE.Group();
    scene.add(toolGroup);

    const tipMat = new THREE.MeshStandardMaterial({ color: 0xdd9977, roughness: 0.6 });
    const tipGeo = new THREE.SphereGeometry(0.038, 16, 12);
    toolTip = new THREE.Mesh(tipGeo, tipMat);
    toolGroup.add(toolTip);

    // Tool rod extending away from clay
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xd4bc8a, roughness: 0.75 });
    const rodGeo = new THREE.CylinderGeometry(0.01, 0.016, 0.55, 8);
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.x = 0.3;
    toolGroup.add(rod);
  }

  // ── Input handling ────────────────────────────────────────────────────────

  function mapY(clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const ny   = 1 - (clientY - rect.top) / rect.height;
    return Math.max(-H * 0.92, Math.min(H * 0.92, (ny - 0.5) * 2 * H * 1.15));
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('clay-canvas');
    if (!canvas) return;

    initProfile();
    initScene(canvas);
    buildGeometry();

    // Mouse
    canvas.addEventListener('mousemove',  e => { toolY = mapY(e.clientY, canvas); });
    canvas.addEventListener('mousedown',  e => { if (e.button === 0) pressing = true; });
    canvas.addEventListener('mouseup',    () => { pressing = false; });
    canvas.addEventListener('mouseleave', () => { pressing = false; });

    // Touch
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      pressing = true;
      toolY = mapY(e.touches[0].clientY, canvas);
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      toolY = mapY(e.touches[0].clientY, canvas);
    }, { passive: false });
    canvas.addEventListener('touchend', () => { pressing = false; });

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (e.key === 'r' || e.key === 'R') { initProfile(); buildGeometry(); }
      if (e.key === 's' || e.key === 'S') smoothProfile();
      if (e.key === 'c' || e.key === 'C') setMode('carve');
      if (e.key === 'e' || e.key === 'E') setMode('expand');
    });

    // Buttons
    document.querySelectorAll('.clay-btn[data-mode]').forEach(btn =>
      btn.addEventListener('click', () => setMode(btn.dataset.mode))
    );
    document.getElementById('btn-smooth')?.addEventListener('click', smoothProfile);
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      initProfile();
      buildGeometry();
    });

    // ── Render loop ──────────────────────────────────────────────────────────
    let prev = 0;
    function animate(t) {
      requestAnimationFrame(animate);
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;

      // Spin the clay
      spinGroup.rotation.y += SPIN_SPEED * dt;

      // Deform if pressing
      if (pressing) {
        deform();
        if (needsBuild) buildGeometry();
      }

      // Tool approach animation: eases in when pressing, out when released
      toolApproach += ((pressing ? 1 : 0) - toolApproach) * 0.15;
      const r   = radiusAt(toolY);
      const gap = 0.08 * (1 - toolApproach) + 0.005 * toolApproach;
      toolGroup.position.set(r + gap, toolY, 0);

      // Responsive resize
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (renderer.domElement.width !== w || renderer.domElement.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  });
})();
