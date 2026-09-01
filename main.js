import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const app = document.getElementById("app");
const errorBox = document.getElementById("error");
function showError(message) {
  errorBox.style.display = "block";
  errorBox.textContent = String(message);
}
window.addEventListener("error", (event) => showError(event.message));

const scene = new THREE.Scene();

const MATERIAL_PRESETS = [
  { name: "copper",  body: 0xb66b38, rim: 0xd18a52, ambient: 0xffefdf, key: 0xffd7a8, fill: 0xffa05b },
  { name: "silver",  body: 0xb8bec8, rim: 0xe5ebf2, ambient: 0xf5f8ff, key: 0xf2f5ff, fill: 0xbec8d9 },
  { name: "gold",    body: 0xc49a2c, rim: 0xf1d27a, ambient: 0xfff3c4, key: 0xffe08a, fill: 0xe0b84d },
  { name: "diamond", body: 0xdff6ff, rim: 0xc8f2ff, ambient: 0xf8feff, key: 0xffffff, fill: 0xb6ecff }
];

function chooseMaterialPreset() {
  const roll = Math.random() * 100;
  if (roll < 50) return MATERIAL_PRESETS[0];
  if (roll < 85) return MATERIAL_PRESETS[1];
  if (roll < 99.9) return MATERIAL_PRESETS[2];
  return MATERIAL_PRESETS[3];
}
let materialPreset = chooseMaterialPreset();

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = false;
controls.enablePan = true;
controls.minDistance = 2.35;
controls.maxDistance = 8.0;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(materialPreset.ambient, 1.7));
const keyLight = new THREE.DirectionalLight(materialPreset.key, 2.8);
keyLight.position.set(4, 3.5, 7);
scene.add(keyLight);
const warmFill = new THREE.DirectionalLight(materialPreset.fill, 1.3);
warmFill.position.set(-5, -1, 4);
scene.add(warmFill);
const coolRim = new THREE.DirectionalLight(0xd7e7ff, 0.85);
coolRim.position.set(-3, 5, -4);
scene.add(coolRim);

const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
[
  [0xffe1bc, 26, [4, 3, 6]],
  [0xffa96c, 16, [-3, 1, 3]],
  [0xd6e6ff, 12, [-5, 2, -1]],
].forEach(([color, intensity, position]) => {
  const light = new THREE.PointLight(color, intensity, 0, 2);
  light.position.set(...position);
  envScene.add(light);
});
scene.environment = pmrem.fromScene(envScene, 0.06).texture;

const loader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

function mixChannel(a, b, t) { return a + (b - a) * t; }
function hslToRgb(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}
function createMaterialGradient(preset) {
  if (preset.name === "silver") return { shadow:[55,61,73], mid:[182,190,205], highlight:[245,248,255], warmth:0.0, sparkle:0.02 };
  if (preset.name === "gold") return { shadow:[92,65,10], mid:[202,157,48], highlight:[255,233,155], warmth:0.12, sparkle:0.03 };
  if (preset.name === "diamond") return { shadow:[110,150,170], mid:[215,243,250], highlight:[255,255,255], warmth:-0.03, sparkle:0.12 };
  return { shadow:[74,35,18], mid:[184,107,56], highlight:[255,193,134], warmth:0.08, sparkle:0.02 };
}
function tintCoinArtwork(texture, preset, rotation = 0) {
  const source = texture.image;
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const gradient = createMaterialGradient(preset);
  const width = canvas.width;
  const height = canvas.height;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha === 0) continue;

    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const contrast = Math.min(1, Math.max(0, Math.pow(luma, 0.9)));
    const edgeBoost = Math.min(1, Math.max(0, (luma - 0.45) * 1.8 + 0.5));

    let nr, ng, nb;
    if (contrast < 0.5) {
      const t = contrast / 0.5;
      nr = mixChannel(gradient.shadow[0], gradient.mid[0], t);
      ng = mixChannel(gradient.shadow[1], gradient.mid[1], t);
      nb = mixChannel(gradient.shadow[2], gradient.mid[2], t);
    } else {
      const t = (contrast - 0.5) / 0.5;
      nr = mixChannel(gradient.mid[0], gradient.highlight[0], t);
      ng = mixChannel(gradient.mid[1], gradient.highlight[1], t);
      nb = mixChannel(gradient.mid[2], gradient.highlight[2], t);
    }

    const sparkleSeed = Math.sin(pixelIndex * 0.013) * Math.cos(pixelIndex * 0.00073 + 1.7);
    const sparkle = Math.max(0, sparkleSeed) * 255 * gradient.sparkle;
    nr = Math.min(255, nr + 18 * edgeBoost + 30 * gradient.warmth * edgeBoost + sparkle);
    ng = Math.min(255, ng + 12 * edgeBoost + sparkle * 0.85);
    nb = Math.min(255, nb + 8 * edgeBoost + sparkle * 1.1);

    if (preset.name === "diamond") {
      const nx = x / width - 0.5;
      const ny = y / height - 0.5;
      const radial = Math.min(1, Math.sqrt(nx * nx + ny * ny) / 0.7071);
      const angle = Math.atan2(ny, nx);
      const hue = (0.58 + 0.18 * Math.sin(radial * 20 - angle * 1.5) + 0.12 * Math.cos(nx * 34 + ny * 21) + 0.07 * Math.sin((nx - ny) * 55)) % 1;
      const normalizedHue = hue < 0 ? hue + 1 : hue;
      const saturation = 0.28 + 0.45 * (1 - luma) + 0.12 * (1 - radial);
      const lightness = Math.min(0.9, 0.58 + 0.28 * edgeBoost + 0.08 * (1 - radial));
      const [rr, rg, rb] = hslToRgb(normalizedHue, Math.min(1, saturation), lightness);
      const prismBlend = 0.22 + 0.45 * edgeBoost + 0.18 * (1 - radial);
      nr = mixChannel(nr, rr, prismBlend);
      ng = mixChannel(ng, rg, prismBlend);
      nb = mixChannel(nb, rb, prismBlend);
    }
    data[i] = nr; data[i+1] = ng; data[i+2] = nb;
  }

  ctx.putImageData(imageData, 0, 0);
  const tintedTexture = new THREE.CanvasTexture(canvas);
  tintedTexture.anisotropy = maxAnisotropy;
  tintedTexture.wrapS = tintedTexture.wrapT = THREE.ClampToEdgeWrapping;
  tintedTexture.center.set(0.5, 0.5);
  tintedTexture.rotation = rotation;
  tintedTexture.colorSpace = THREE.SRGBColorSpace;
  tintedTexture.needsUpdate = true;
  return tintedTexture;
}

const [frontBase, backBase, bumpMap, bumpMapBack] = await Promise.all([
  loader.loadAsync("./coin_face_front.webp"),
  loader.loadAsync("./coin_face_back.webp"),
  loader.loadAsync("./coin_bump.webp"),
  loader.loadAsync("./coin_bump_back.webp"),
]);

const frontMap = tintCoinArtwork(frontBase, materialPreset, 0);
const backMap = tintCoinArtwork(backBase, materialPreset, Math.PI);

for (const tex of [frontMap, backMap, bumpMap, bumpMapBack]) {
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.center.set(0.5, 0.5);
  tex.repeat.set(1.0, 1.0);
  tex.offset.set(0.0, 0.0);
}
frontMap.rotation = 0;
backMap.rotation = Math.PI;
bumpMap.rotation = 0;
bumpMapBack.rotation = Math.PI;

const coin = new THREE.Group();
scene.add(coin);
coin.quaternion.identity();

const radius = 1.9;
const thickness = 0.18;
const isDiamondMaterial = materialPreset.name === "diamond";

const bodyMat = new THREE.MeshPhysicalMaterial({
  color: materialPreset.body,
  metalness: isDiamondMaterial ? 0.0 : 1.0,
  roughness: isDiamondMaterial ? 0.03 : 0.22,
  clearcoat: isDiamondMaterial ? 1.0 : 0.22,
  clearcoatRoughness: isDiamondMaterial ? 0.01 : 0.18,
  transmission: 0.0,
  ior: isDiamondMaterial ? 2.35 : 1.5,
  thickness: 0.0,
  envMapIntensity: isDiamondMaterial ? 3.6 : 1.9,
});

const faceBase = {
  color: 0xffffff,
  metalness: isDiamondMaterial ? 0.0 : 0.95,
  roughness: isDiamondMaterial ? 0.035 : 0.28,
  clearcoat: isDiamondMaterial ? 1.0 : 0.18,
  clearcoatRoughness: isDiamondMaterial ? 0.01 : 0.18,
  transmission: 0.0,
  ior: isDiamondMaterial ? 2.35 : 1.5,
  thickness: 0.0,
  envMapIntensity: isDiamondMaterial ? 3.4 : 1.85,
};

const faceMatFront = new THREE.MeshPhysicalMaterial({ ...faceBase, map: frontMap, bumpMap, bumpScale: isDiamondMaterial ? 0.16 : 0.12 });
const faceMatBack  = new THREE.MeshPhysicalMaterial({ ...faceBase, map: backMap, bumpMap: bumpMapBack, bumpScale: isDiamondMaterial ? 0.16 : 0.12 });

const edgeGeo = new THREE.CylinderGeometry(radius, radius, thickness, 256, 1, false);
const edge = new THREE.Mesh(edgeGeo, bodyMat);
edge.rotation.x = Math.PI / 2;
coin.add(edge);

const faceGeo = new THREE.CircleGeometry(radius, 256);
const frontFace = new THREE.Mesh(faceGeo, faceMatFront);
frontFace.position.z = thickness / 2 + 0.001;
coin.add(frontFace);

const backFace = new THREE.Mesh(faceGeo, faceMatBack);
backFace.position.z = -(thickness / 2 + 0.001);
backFace.rotation.y = Math.PI;
coin.add(backFace);

const rimMat = new THREE.MeshPhysicalMaterial({
  color: materialPreset.rim,
  metalness: isDiamondMaterial ? 0.0 : 1,
  roughness: isDiamondMaterial ? 0.02 : 0.14,
  clearcoat: isDiamondMaterial ? 1.0 : 0.24,
  clearcoatRoughness: isDiamondMaterial ? 0.008 : 0.18,
  transmission: 0.0,
  ior: isDiamondMaterial ? 2.35 : 1.5,
  thickness: 0.0,
  envMapIntensity: isDiamondMaterial ? 3.8 : 1.9,
});

const rimFront = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.015, 0.02, 20, 256), rimMat);
rimFront.position.z = thickness / 2 + 0.0015;
coin.add(rimFront);
const rimBack = rimFront.clone();
rimBack.position.z = -(thickness / 2 + 0.0015);
coin.add(rimBack);

let isDraggingCoin = false;
let dragPointerId = null;
let dragStart = { x: 0, y: 0 };
let dragStartQuat = new THREE.Quaternion();

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (isFlipping) return;
  if (event.button === 0) {
    isDraggingCoin = true;
    dragPointerId = event.pointerId;
    dragStart.x = event.clientX;
    dragStart.y = event.clientY;
    dragStartQuat.copy(coin.quaternion);
    renderer.domElement.setPointerCapture(event.pointerId);
  }
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!isDraggingCoin || event.pointerId !== dragPointerId || isFlipping) return;

  const dx = (event.clientX - dragStart.x) / window.innerWidth;
  const dy = (event.clientY - dragStart.y) / window.innerHeight;

  const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * Math.PI * 2.0);
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * Math.PI * 2.0);

  coin.quaternion.copy(dragStartQuat).premultiply(qy).premultiply(qx);
});

function stopDrag(event) {
  if (event.pointerId === dragPointerId) {
    isDraggingCoin = false;
    dragPointerId = null;
  }
}
renderer.domElement.addEventListener("pointerup", stopDrag);
renderer.domElement.addEventListener("pointercancel", stopDrag);

const radialControl = document.getElementById("radialControl");
const lightIndicator = document.getElementById("lightIndicator");
const lightZInput = document.getElementById("lightZ");
const lightZValue = document.getElementById("lightZValue");
const sideFrontBtn = document.getElementById("sideFront");
const sideBackBtn = document.getElementById("sideBack");
const resetCoinBtn = document.getElementById("resetCoin");

let lightX = 4, lightY = 3.5, lightZ = 7, draggingLight = false;

function updateIndicatorPosition() {
  const rect = radialControl.getBoundingClientRect();
  const cx = rect.width / 2, cy = rect.height / 2, radiusPx = Math.min(cx, cy) - 10;
  const clampedX = (lightX / 10) * radiusPx;
  const clampedY = (lightY / 10) * radiusPx;
  lightIndicator.style.left = `${cx + clampedX}px`;
  lightIndicator.style.top = `${cy + clampedY}px`;
}
function updateLightPosition() {
  keyLight.position.set(lightX, lightY, lightZ);
  lightZValue.textContent = lightZ.toFixed(1);
  updateIndicatorPosition();
}
function updateLightFromRadial(clientX, clientY) {
  const rect = radialControl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radiusPx = Math.min(rect.width, rect.height) / 2 - 10;
  const dx = clientX - cx, dy = clientY - cy;
  const dist = Math.min(Math.hypot(dx, dy), radiusPx);
  const ang = Math.atan2(dy, dx);
  const n = dist / radiusPx;
  lightX = Math.cos(ang) * 10 * n;
  lightY = Math.sin(ang) * 10 * n;
  updateLightPosition();
}
radialControl.addEventListener("pointerdown", (e) => { draggingLight = true; updateLightFromRadial(e.clientX, e.clientY); });
window.addEventListener("pointermove", (e) => { if (draggingLight) updateLightFromRadial(e.clientX, e.clientY); });
window.addEventListener("pointerup", () => draggingLight = false);
lightZInput.addEventListener("input", () => { lightZ = parseFloat(lightZInput.value); updateLightPosition(); });
sideFrontBtn.addEventListener("click", () => {
  lightZ = Math.abs(parseFloat(lightZInput.value));
  lightZInput.value = String(lightZ);
  sideFrontBtn.classList.add("active");
  sideBackBtn.classList.remove("active");
  updateLightPosition();
});
sideBackBtn.addEventListener("click", () => {
  lightZ = -Math.abs(parseFloat(lightZInput.value));
  lightZInput.value = String(lightZ);
  sideBackBtn.classList.add("active");
  sideFrontBtn.classList.remove("active");
  updateLightPosition();
});
resetCoinBtn.addEventListener("click", () => {
  coin.quaternion.identity();
  camera.position.set(0, 0, 7.5);
  controls.target.set(0, 0, 0);
  controls.update();
});
updateLightPosition();

const backgroundMusic = document.getElementById("backgroundMusic");
const muteButton = document.getElementById("muteButton");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
let isMuted = false, previousVolume = 0.5, audioStarted = false;
function initializeAudio() {
  if (audioStarted) return;
  audioStarted = true;
  backgroundMusic.volume = previousVolume;
  backgroundMusic.play().catch(() => { audioStarted = false; });
}
["pointerdown", "keydown", "touchstart"].forEach(evt => document.addEventListener(evt, initializeAudio, { once: true }));
muteButton.addEventListener("click", async () => {
  initializeAudio();
  isMuted = !isMuted;
  if (isMuted) {
    previousVolume = backgroundMusic.volume || previousVolume;
    backgroundMusic.volume = 0;
    muteButton.classList.add("muted");
    muteButton.textContent = "🔇 Unmute";
  } else {
    backgroundMusic.volume = previousVolume;
    muteButton.classList.remove("muted");
    muteButton.textContent = "🔊 Mute";
    try { await backgroundMusic.play(); } catch {}
  }
});
volumeSlider.addEventListener("input", async (e) => {
  initializeAudio();
  const volume = parseFloat(e.target.value) / 100;
  previousVolume = volume;
  if (!isMuted) backgroundMusic.volume = volume;
  volumeValue.textContent = `${e.target.value}%`;
  try { if (!backgroundMusic.paused) await backgroundMusic.play(); } catch {}
});

const callHeadsBtn = document.getElementById("callHeads");
const callTailsBtn = document.getElementById("callTails");
const flipButton = document.getElementById("flipButton");
const refreshCoinButton = document.getElementById("refreshCoinButton");
const resultDisplay = document.getElementById("resultDisplay");
const historyPanel = document.getElementById("historyPanel");
const historyToggle = document.getElementById("historyToggle");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

let playerCall = null;
let isFlipping = false;
const flipHistory = [];

historyToggle.addEventListener("click", () => historyPanel.classList.toggle("collapsed"));

function renderHistory() {
  historyList.innerHTML = "";
  historyEmpty.style.display = flipHistory.length ? "none" : "block";
  flipHistory.forEach((entry, idx) => {
    const item = document.createElement("li");
    item.className = "history-item";
    const badge = document.createElement("span");
    badge.className = `history-badge ${entry.statusClass}`;
    badge.textContent = entry.badge;
    const textWrap = document.createElement("div");
    const result = document.createElement("div");
    result.className = "history-result";
    result.textContent = entry.result;
    textWrap.appendChild(result);
    if (entry.callText) {
      const call = document.createElement("div");
      call.className = "history-call";
      call.textContent = entry.callText;
      textWrap.appendChild(call);
    }
    const index = document.createElement("div");
    index.className = "history-index";
    index.textContent = `#${flipHistory.length - idx}`;
    item.appendChild(badge);
    item.appendChild(textWrap);
    item.appendChild(index);
    historyList.appendChild(item);
  });
}
renderHistory();

function addHistoryEntry(landedFace, playerCallAtFlip) {
  let entry;
  if (playerCallAtFlip) {
    const won = playerCallAtFlip === landedFace;
    entry = { badge: won ? "W" : "L", statusClass: won ? "win" : "lose", result: landedFace, callText: `Call: ${playerCallAtFlip}` };
  } else {
    entry = { badge: landedFace === "HEADS" ? "H" : "T", statusClass: "neutral", result: landedFace, callText: "No call" };
  }
  flipHistory.unshift(entry);
  if (flipHistory.length > 10) flipHistory.length = 10;
  renderHistory();
}

callHeadsBtn.addEventListener("click", () => selectCall("HEADS"));
callTailsBtn.addEventListener("click", () => selectCall("TAILS"));
flipButton.addEventListener("click", flipCoin);
if (refreshCoinButton) refreshCoinButton.addEventListener("click", refreshCoinMaterial);

function selectCall(call) {
  if (playerCall === call) {
    playerCall = null;
    callHeadsBtn.classList.remove("selected");
    callTailsBtn.classList.remove("selected");
  } else {
    playerCall = call;
    callHeadsBtn.classList.toggle("selected", call === "HEADS");
    callTailsBtn.classList.toggle("selected", call === "TAILS");
  }
  resultDisplay.textContent = "";
  resultDisplay.className = "result-display";
  resultDisplay.style.color = "";
}

function getVisibleFace() {
  const frontNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(coin.quaternion);
  const toCamera = camera.position.clone().sub(coin.position).normalize();
  return frontNormal.dot(toCamera) >= 0 ? "HEADS" : "TAILS";
}

function flipCoin() {
  if (isFlipping) return;

  initializeAudio();
  isFlipping = true;
  controls.enabled = false;
  flipButton.disabled = true;
  callHeadsBtn.disabled = true;
  callTailsBtn.disabled = true;

  resultDisplay.textContent = "Flipping...";
  resultDisplay.className = "result-display flipping";
  resultDisplay.style.color = "";

  const playerCallAtFlip = playerCall;
  const result = Math.random() < 0.5 ? "HEADS" : "TAILS";

  const currentFace = getVisibleFace();
  const needsHalfTurn = currentFace === result ? 0 : Math.PI;
  const spins = 6 * Math.PI;
  const totalAngle = spins + needsHalfTurn;

  const axis = new THREE.Vector3(1, 0, 0);
  const baseQuat = coin.quaternion.clone();

  const duration = 1500;
  const startTime = performance.now();

  function animateFlip(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const currentAngle = totalAngle * eased;
    const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, currentAngle);
    coin.quaternion.copy(baseQuat).multiply(deltaQuat);

    if (t < 1) {
      requestAnimationFrame(animateFlip);
      return;
    }

    const landedFace = getVisibleFace();

    if (playerCallAtFlip) {
      const won = playerCallAtFlip === landedFace;
      if (won) {
        resultDisplay.textContent = `🎉 You Won! ${landedFace}!`;
        resultDisplay.className = "result-display win";
      } else {
        resultDisplay.textContent = `😢 You Lost! It was ${landedFace}!`;
        resultDisplay.className = "result-display lose";
      }
    } else {
      resultDisplay.textContent = `🎲 Result: ${landedFace}!`;
      resultDisplay.className = "result-display";
      resultDisplay.style.color = "#ffd700";
    }

    addHistoryEntry(landedFace, playerCallAtFlip);
    isFlipping = false;
    controls.enabled = true;
    flipButton.disabled = false;
    callHeadsBtn.disabled = false;
    callTailsBtn.disabled = false;
  }

  requestAnimationFrame(animateFlip);
}

function applyMaterialPresetToCoin() {
  materialPreset = chooseMaterialPreset();
  const diamondNow = materialPreset.name === "diamond";

  const newFrontMap = tintCoinArtwork(frontBase, materialPreset, 0);
  const newBackMap = tintCoinArtwork(backBase, materialPreset, Math.PI);
  for (const tex of [newFrontMap, newBackMap]) {
    tex.anisotropy = maxAnisotropy;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.center.set(0.5, 0.5);
  }
  newFrontMap.rotation = 0;
  newBackMap.rotation = Math.PI;

  if (faceMatFront.map) faceMatFront.map.dispose();
  if (faceMatBack.map) faceMatBack.map.dispose();
  faceMatFront.map = newFrontMap;
  faceMatBack.map = newBackMap;

  scene.children.forEach((obj) => {
    if (obj.isAmbientLight) obj.color.setHex(materialPreset.ambient);
  });
  keyLight.color.setHex(materialPreset.key);
  warmFill.color.setHex(materialPreset.fill);

  bodyMat.color.setHex(materialPreset.body);
  bodyMat.metalness = diamondNow ? 0.78 : 1.0;
  bodyMat.roughness = diamondNow ? 0.10 : bodyMat.roughness;
  bodyMat.clearcoat = 1.0;
  bodyMat.clearcoatRoughness = diamondNow ? 0.04 : bodyMat.clearcoatRoughness;
  bodyMat.transmission = 0.0;
  bodyMat.thickness = 0.0;
  bodyMat.ior = 1.5;
  bodyMat.envMapIntensity = diamondNow ? 3.0 : bodyMat.envMapIntensity;

  faceMatFront.metalness = diamondNow ? 0.72 : 0.95;
  faceMatBack.metalness = diamondNow ? 0.72 : 0.95;
  faceMatFront.roughness = diamondNow ? 0.12 : faceMatFront.roughness;
  faceMatBack.roughness = diamondNow ? 0.12 : faceMatBack.roughness;
  faceMatFront.clearcoat = 1.0;
  faceMatBack.clearcoat = 1.0;
  faceMatFront.clearcoatRoughness = diamondNow ? 0.04 : faceMatFront.clearcoatRoughness;
  faceMatBack.clearcoatRoughness = diamondNow ? 0.04 : faceMatBack.clearcoatRoughness;
  faceMatFront.transmission = 0.0;
  faceMatBack.transmission = 0.0;
  faceMatFront.thickness = 0.0;
  faceMatBack.thickness = 0.0;
  faceMatFront.ior = 1.5;
  faceMatBack.ior = 1.5;

  rimMat.color.setHex(materialPreset.rim);
  rimMat.metalness = diamondNow ? 0.82 : 1.0;
  rimMat.roughness = diamondNow ? 0.08 : rimMat.roughness;
  rimMat.clearcoat = 1.0;
  rimMat.clearcoatRoughness = diamondNow ? 0.03 : rimMat.clearcoatRoughness;
  rimMat.transmission = 0.0;
  rimMat.thickness = 0.0;
  rimMat.ior = 1.5;

  [bodyMat, faceMatFront, faceMatBack, rimMat].forEach((mat) => mat.needsUpdate = true);
}

function refreshCoinMaterial() {
  if (isFlipping) return;
  applyMaterialPresetToCoin();
}

window.addEventListener("resize", onResize);
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
