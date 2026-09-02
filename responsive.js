import * as THREE from "three";

const MOBILE_QUERY = "(max-width: 760px), (pointer: coarse)";
const mobileMedia = window.matchMedia(MOBILE_QUERY);

function isMobileLike() {
  return mobileMedia.matches || Math.min(window.innerWidth, window.innerHeight) <= 760;
}

// Keep the coin framed on narrow portrait screens without changing the scene itself.
// The desktop camera uses a 34-degree vertical FOV; on portrait screens we widen the
// vertical FOV so the horizontal framing remains close to the desktop composition.
const originalUpdateProjectionMatrix = THREE.PerspectiveCamera.prototype.updateProjectionMatrix;
THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function responsiveProjection() {
  if (this.__sbrBaseFov == null) this.__sbrBaseFov = this.fov;

  const baseFov = this.__sbrBaseFov;
  const mobile = isMobileLike();

  if (mobile && this.aspect < 1) {
    const baseRadians = THREE.MathUtils.degToRad(baseFov);
    const adapted = 2 * Math.atan(Math.tan(baseRadians / 2) / Math.max(this.aspect, 0.38));
    this.fov = Math.min(82, THREE.MathUtils.radToDeg(adapted));
  } else if (mobile) {
    this.fov = Math.max(baseFov, 38);
  } else {
    this.fov = baseFov;
  }

  return originalUpdateProjectionMatrix.call(this);
};

// High-DPI phones can otherwise render several million WebGL pixels per frame.
const originalSetPixelRatio = THREE.WebGLRenderer.prototype.setPixelRatio;
THREE.WebGLRenderer.prototype.setPixelRatio = function responsivePixelRatio(value) {
  const cap = isMobileLike() ? 1.5 : 2;
  return originalSetPixelRatio.call(this, Math.min(value, cap));
};

function makePanelToggle(panel, label) {
  if (!panel || panel.querySelector(":scope > .mobile-panel-toggle")) return;

  panel.classList.add("mobile-collapsible");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mobile-panel-toggle";
  button.textContent = label;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", `${label} controls`);
  panel.prepend(button);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!isMobileLike()) return;

    const opening = panel.classList.contains("mobile-collapsed");
    document.querySelectorAll(".mobile-collapsible").forEach((other) => {
      if (other !== panel) {
        other.classList.add("mobile-collapsed");
        const otherButton = other.querySelector(":scope > .mobile-panel-toggle");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      }
    });

    panel.classList.toggle("mobile-collapsed", !opening);
    button.setAttribute("aria-expanded", String(opening));
  });
}

function syncResponsivePanels() {
  const lightPanel = document.querySelector(".light-controls");
  const musicPanel = document.querySelector(".music-controls");
  const historyPanel = document.getElementById("historyPanel");

  makePanelToggle(lightPanel, "Light");
  makePanelToggle(musicPanel, "Audio");

  if (isMobileLike()) {
    [lightPanel, musicPanel].forEach((panel) => {
      if (!panel) return;
      panel.classList.add("mobile-collapsed");
      const button = panel.querySelector(":scope > .mobile-panel-toggle");
      if (button) button.setAttribute("aria-expanded", "false");
    });
    if (historyPanel) historyPanel.classList.add("collapsed");
  } else {
    [lightPanel, musicPanel].forEach((panel) => {
      if (!panel) return;
      panel.classList.remove("mobile-collapsed");
      const button = panel.querySelector(":scope > .mobile-panel-toggle");
      if (button) button.setAttribute("aria-expanded", "true");
    });
  }
}

function installCanvasTouchGuard() {
  const canvas = document.querySelector("#app canvas");
  if (!canvas || canvas.dataset.mobileTouchGuard === "true") return false;

  canvas.dataset.mobileTouchGuard = "true";
  canvas.setAttribute("aria-label", "Interactive 3D coin. Drag with one finger to rotate.");

  // The app's custom drag handler is single-pointer. Ignore secondary touches so
  // accidental two-finger gestures do not replace the active drag pointer.
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((type) => {
    canvas.addEventListener(type, (event) => {
      if (event.pointerType === "touch" && !event.isPrimary) {
        event.stopPropagation();
      }
    }, true);
  });

  return true;
}

function initializeResponsiveUI() {
  syncResponsivePanels();

  if (!installCanvasTouchGuard()) {
    const app = document.getElementById("app");
    if (app) {
      const observer = new MutationObserver(() => {
        if (installCanvasTouchGuard()) observer.disconnect();
      });
      observer.observe(app, { childList: true, subtree: true });
    }
  }

  document.addEventListener("pointerdown", (event) => {
    if (!isMobileLike()) return;
    document.querySelectorAll(".mobile-collapsible:not(.mobile-collapsed)").forEach((panel) => {
      if (panel.contains(event.target)) return;
      panel.classList.add("mobile-collapsed");
      const button = panel.querySelector(":scope > .mobile-panel-toggle");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeResponsiveUI, { once: true });
} else {
  initializeResponsiveUI();
}

const handleMediaChange = () => syncResponsivePanels();
if (typeof mobileMedia.addEventListener === "function") {
  mobileMedia.addEventListener("change", handleMediaChange);
} else if (typeof mobileMedia.addListener === "function") {
  mobileMedia.addListener(handleMediaChange);
}
