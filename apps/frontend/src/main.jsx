import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Compass,
  Eye,
  Film,
  Headphones,
  History,
  Image as ImageIcon,
  Landmark,
  LogOut,
  MapPin,
  Pause,
  Play,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { api, clearSession, getSavedUser, setSession } from "./api/client";
import "./styles.css";

const CATEGORIES = [
  "Waterfall",
  "Hill View",
  "Heritage",
  "Forest",
  "River",
  "Temple",
  "Village",
  "Food Trail",
];
const DISTRICTS = [
  "Indore",
  "Bhopal",
  "Raisen",
  "Chhindwara",
  "Dhar",
  "Jabalpur",
  "Mandla",
  "Rewa",
  "Ujjain",
];
const GUIDE_TABS = [
  { id: "pano", icon: Eye, label: "360 View" },
  { id: "photos", icon: ImageIcon, label: "Photos" },
  { id: "video", icon: Film, label: "Video" },
  { id: "history", icon: History, label: "History" },
  { id: "audio", icon: Headphones, label: "Audio Guide" },
  { id: "graphics", icon: Sparkles, label: "CG Lab" },
];
const MP_CENTER = [23.4733, 77.947998];
const MP_BOUNDS = [
  [21.08, 74.02],
  [26.9, 82.82],
];
const CG_BOUNDS = {
  north: 26.9,
  south: 21.08,
  east: 82.82,
  west: 74.02,
};
const MP_CANVAS_SHAPE = [
  [39, 4],
  [58, 9],
  [73, 20],
  [84, 38],
  [80, 58],
  [66, 74],
  [51, 93],
  [34, 88],
  [17, 71],
  [11, 49],
  [19, 27],
];
const CG_FALLBACK_ALGORITHMS = [
  {
    name: "Coordinate Projection",
    detail: "Latitude-longitude values are converted into 2D screen positions.",
  },
  {
    name: "DDA Line Drawing",
    detail: "The route is rasterized into visible pixels using incremental x/y steps.",
  },
  {
    name: "Bezier Path Animation",
    detail: "A smooth curve controls the animated guide marker's travel path.",
  },
  {
    name: "2D Transformations",
    detail: "Translation, rotation, and scaling are applied every frame.",
  },
];

function FitToPlaces({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!places.length) return;
    map.fitBounds(
      places.map((place) => [place.latitude, place.longitude]),
      { maxZoom: 8, padding: [28, 28] },
    );
  }, [map, places]);

  return null;
}

function PanoramaViewer({ place }) {
  const [view, setView] = useState({ x: 50, y: 50, zoom: 220 });
  const drag = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    setView({ x: 50, y: 50, zoom: 220 });
  }, [place?.id]);

  if (!place) {
    return <div className="empty-view">Select a place to open its 360 view.</div>;
  }

  return (
    <div
      aria-label={`360 view of ${place.title}`}
      className="panorama-view"
      onPointerDown={(event) => {
        drag.current = { active: true, x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current.active) return;
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        drag.current = { active: true, x: event.clientX, y: event.clientY };
        setView((current) => ({
          ...current,
          x: (current.x - dx * 0.08 + 100) % 100,
          y: Math.max(18, Math.min(82, current.y + dy * 0.08)),
        }));
      }}
      onPointerUp={(event) => {
        drag.current.active = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onWheel={(event) => {
        event.preventDefault();
        setView((current) => ({
          ...current,
          zoom: Math.max(150, Math.min(390, current.zoom - event.deltaY * 0.08)),
        }));
      }}
      role="img"
      style={{
        backgroundImage: `url(${place.panoramaDataUrl})`,
        backgroundPosition: `${view.x}% ${view.y}%`,
        backgroundSize: `${view.zoom}% auto`,
      }}
      tabIndex={0}
    >
      <span>Drag to look around • Scroll to zoom</span>
    </div>
  );
}

function AudioGuide({ text }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function play() {
    if (!text) return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis?.speak(utterance);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return (
    <div className="audio-card">
      <div>
        <p className="mini">Browser audio narration</p>
        <h3>सुनिए स्थान की कहानी</h3>
        <p>{text}</p>
      </div>
      <div className="audio-actions">
        <button className="primary" onClick={play} type="button">
          <Play size={17} /> Play Guide
        </button>
        <button onClick={stop} type="button">
          <Pause size={17} /> Stop
        </button>
      </div>
      {speaking && <span className="speaking-pill">Audio guide is playing...</span>}
    </div>
  );
}

function VideoGuide({ place }) {
  if (!place?.videoUrl) {
    return (
      <div className="empty-media">
        No video guide added yet. Tourists can add a YouTube/embed/local video URL while uploading.
      </div>
    );
  }

  return (
    <div className="video-frame">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        src={place.videoUrl}
        title={`${place.title} video guide`}
      />
    </div>
  );
}

function Gallery({ place }) {
  const photos = place?.gallery ?? [];

  if (!photos.length) {
    return <div className="empty-media">No photographs added yet for this location.</div>;
  }

  return (
    <div className="gallery-grid">
      {photos.map((photo) => (
        <figure key={photo.id}>
          <img alt={photo.caption || place.title} src={photo.dataUrl} />
          <figcaption>{photo.caption || place.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function StoryGuide({ guide, place }) {
  const chapters = guide?.chapters ?? [];

  return (
    <div className="story-guide">
      <div className="story-route">
        {chapters.map((chapter, index) => (
          <article key={chapter.heading}>
            <span>{index + 1}</span>
            <div>
              <h3>{chapter.heading}</h3>
              <p>{chapter.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="travel-notes">
        <h3>Tourist Notes</h3>
        <p><strong>Best time:</strong> {place.bestTime || "Not specified"}</p>
        <p><strong>Local food:</strong> {place.localFood || "Not added"}</p>
        <p><strong>Safety:</strong> {place.safetyNote || "Follow normal travel safety."}</p>
        <p><strong>Accessibility:</strong> {place.accessibility || "Not added"}</p>
      </div>
    </div>
  );
}

function projectLatLngToPercent(latitude, longitude) {
  const x = ((longitude - CG_BOUNDS.west) / (CG_BOUNDS.east - CG_BOUNDS.west)) * 100;
  const y = ((CG_BOUNDS.north - latitude) / (CG_BOUNDS.north - CG_BOUNDS.south)) * 100;

  return {
    mapX: Math.max(3, Math.min(97, x)),
    mapY: Math.max(3, Math.min(97, y)),
  };
}

function getMapPercent(place) {
  if (Number.isFinite(place?.mapX) && Number.isFinite(place?.mapY)) {
    return { mapX: place.mapX, mapY: place.mapY };
  }

  return projectLatLngToPercent(place?.latitude ?? 23.4733, place?.longitude ?? 77.948);
}

function formatMetric(value, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "--";
}

function pointFromMap(place, width, height, margin = 36) {
  const { mapX, mapY } = getMapPercent(place);

  return {
    x: margin + (mapX / 100) * (width - margin * 2),
    y: margin + (mapY / 100) * (height - margin * 2),
  };
}

function getDDAPixels(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  const xIncrement = dx / steps;
  const yIncrement = dy / steps;
  const pixels = [];

  for (let index = 0; index <= steps; index += 1) {
    pixels.push({
      x: Math.round(start.x + xIncrement * index),
      y: Math.round(start.y + yIncrement * index),
    });
  }

  return pixels;
}

function quadraticBezier(start, control, end, t) {
  const inverse = 1 - t;

  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCanvasGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(24, 52, 43, 0.11)";
  ctx.lineWidth = 1;

  for (let x = 36; x < width; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 36; y < height; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCgScene(canvas, place, places, guide, progress, showGrid) {
  if (!canvas || !place) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width || 720);
  const height = Math.max(300, rect.height || 430);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const canvasWidth = Math.floor(width * pixelRatio);
  const canvasHeight = Math.floor(height * pixelRatio);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  const ctx = canvas.getContext("2d");
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffaf0");
  gradient.addColorStop(1, "#e7f1e5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (showGrid) {
    drawCanvasGrid(ctx, width, height);
  }

  const margin = 42;
  const outline = MP_CANVAS_SHAPE.map(([x, y]) => ({
    x: margin + (x / 100) * (width - margin * 2),
    y: margin + (y / 100) * (height - margin * 2),
  }));

  ctx.save();
  ctx.beginPath();
  outline.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(31, 107, 69, 0.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(31, 107, 69, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const bhopalHub = {
    title: "Bhopal tourism hub",
    latitude: 23.2599,
    longitude: 77.4126,
    ...projectLatLngToPercent(23.2599, 77.4126),
  };
  const origin = pointFromMap(bhopalHub, width, height, margin);
  const target = pointFromMap(place, width, height, margin);
  const control = {
    x: (origin.x + target.x) / 2,
    y: Math.max(48, Math.min(origin.y, target.y) - 96),
  };
  const routePixels = getDDAPixels(origin, target);

  ctx.save();
  ctx.fillStyle = "rgba(217, 121, 31, 0.72)";
  for (let index = 0; index < routePixels.length; index += 7) {
    const pixel = routePixels[index];
    ctx.fillRect(pixel.x - 1, pixel.y - 1, 3, 3);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  for (let step = 0; step <= 100; step += 1) {
    const point = quadraticBezier(origin, control, target, step / 100);
    ctx.lineTo(point.x, point.y);
  }
  ctx.strokeStyle = "#1f6b45";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();

  (places ?? []).forEach((item) => {
    const point = pointFromMap(item, width, height, margin);
    const selected = item.id === place.id;

    ctx.beginPath();
    ctx.fillStyle = selected ? "#a3271b" : "#1f6b45";
    ctx.arc(point.x, point.y, selected ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = selected ? 3 : 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  });

  ctx.save();
  ctx.fillStyle = "#18342b";
  ctx.font = "700 12px Arial";
  ctx.fillText("Bhopal hub", origin.x + 10, origin.y - 8);
  ctx.fillText(place.title, Math.min(target.x + 10, width - 170), target.y - 10);
  ctx.restore();

  const traveller = quadraticBezier(origin, control, target, progress);
  const next = quadraticBezier(origin, control, target, Math.min(progress + 0.012, 1));
  const direction = Math.atan2(next.y - traveller.y, next.x - traveller.x);
  const orbit = progress * Math.PI * 2;
  const markerScale = 1 + Math.sin(orbit) * 0.16;
  const matrixAngle = direction + Math.sin(orbit) * 0.08;
  const matrix = {
    a: (markerScale * Math.cos(matrixAngle)).toFixed(2),
    b: (-markerScale * Math.sin(matrixAngle)).toFixed(2),
    c: (markerScale * Math.sin(matrixAngle)).toFixed(2),
    d: (markerScale * Math.cos(matrixAngle)).toFixed(2),
    tx: Math.round(traveller.x),
    ty: Math.round(traveller.y),
  };

  ctx.save();
  ctx.translate(traveller.x, traveller.y);
  ctx.rotate(matrixAngle);
  ctx.scale(markerScale, markerScale);
  ctx.fillStyle = "#a3271b";
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-11, -9);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-11, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff7df";
  ctx.fillRect(-2, -4, 8, 8);
  ctx.restore();

  ctx.save();
  roundedRect(ctx, 16, 16, Math.min(340, width - 32), 128, 8);
  ctx.fillStyle = "rgba(255, 250, 240, 0.93)";
  ctx.fill();
  ctx.strokeStyle = "rgba(24, 52, 43, 0.16)";
  ctx.stroke();
  ctx.fillStyle = "#18342b";
  ctx.font = "900 13px Arial";
  ctx.fillText("CG rendering pipeline", 32, 42);
  ctx.font = "700 12px Arial";
  ctx.fillText(`Projection: lat/lng -> (${formatMetric(place.mapX)}%, ${formatMetric(place.mapY)}%)`, 32, 66);
  ctx.fillText(`DDA raster pixels: ${routePixels.length}`, 32, 88);
  ctx.fillText(`Bezier parameter t: ${progress.toFixed(2)}`, 32, 110);
  ctx.fillText(`[${matrix.a}  ${matrix.b}  ${matrix.tx}]`, 32, 132);
  ctx.fillText(`[${matrix.c}   ${matrix.d}  ${matrix.ty}]`, 180, 132);
  ctx.restore();
}

function CGAnimationLab({ guide, place, places }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const progressRef = useRef(0);
  const [running, setRunning] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [speed, setSpeed] = useState(1);
  const algorithms = guide?.graphics?.algorithms ?? CG_FALLBACK_ALGORITHMS;
  const selectedPoint = guide?.graphics?.selectedPoint ?? place;

  useEffect(() => {
    let lastTime = performance.now();

    function animate(now) {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (running) {
        progressRef.current = (progressRef.current + delta * speed * 0.18) % 1;
      }

      drawCgScene(canvasRef.current, place, places, guide, progressRef.current, showGrid);
      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [guide, place, places, running, showGrid, speed]);

  useEffect(() => {
    progressRef.current = 0;
  }, [place?.id]);

  return (
    <div className="cg-lab">
      <div className="cg-header">
        <div>
          <p className="mini">Computer Graphics Assignment Module</p>
          <h3>Animated 2D projection, route rasterization, and transformations</h3>
          <p>
            This canvas converts real tourist coordinates into MP map space, draws
            a DDA pixel route, and animates a guide marker with Bezier motion and
            affine transforms.
          </p>
        </div>
        <div className="matrix-card">
          <strong>Current point</strong>
          <span>Lat {formatMetric(selectedPoint?.latitude, 4)}</span>
          <span>Lng {formatMetric(selectedPoint?.longitude, 4)}</span>
          <span>Map {formatMetric(selectedPoint?.mapX)}%, {formatMetric(selectedPoint?.mapY)}%</span>
        </div>
      </div>

      <div className="cg-canvas-wrap">
        <canvas
          aria-label={`Computer graphics animation for ${place.title}`}
          className="cg-canvas"
          ref={canvasRef}
        />
      </div>

      <div className="cg-controls">
        <button className="primary" onClick={() => setRunning((value) => !value)} type="button">
          {running ? <Pause size={17} /> : <Play size={17} />}
          {running ? "Pause animation" : "Play animation"}
        </button>
        <label className="cg-control">
          Speed
          <input
            max="2.4"
            min="0.4"
            onChange={(event) => setSpeed(Number(event.target.value))}
            step="0.1"
            type="range"
            value={speed}
          />
          <span>{speed.toFixed(1)}x</span>
        </label>
        <label className="cg-toggle">
          <input checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} type="checkbox" />
          Show coordinate grid
        </label>
      </div>

      <div className="cg-notes">
        {algorithms.map((item) => (
          <article key={item.name}>
            <strong>{item.name}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="algorithm-list">
        <strong>Backend projection formula</strong>
        <code>
          {guide?.graphics?.projectionFormula
            ?? "x = ((longitude - west) / (east - west)) * 100; y = ((north - latitude) / (north - south)) * 100"}
        </code>
      </div>
    </div>
  );
}

function AuthPanel({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const session =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);
      setSession(session);
      onLogin(session.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="overlay">
      <form className="auth-card" onSubmit={submit}>
        <div className="form-title">
          <div>
            <p className="mini">Tourist account</p>
            <h2>{mode === "login" ? "Login" : "Create account"}</h2>
          </div>
          <button onClick={onClose} type="button">Close</button>
        </div>
        {mode === "register" && (
          <label>
            Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}
        <label>
          Email
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary full" type="submit">{mode === "login" ? "Login" : "Register"}</button>
        <button className="link-button" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "New tourist? Register here" : "Already registered? Login"}
        </button>
        <p className="demo-note">Demo login: demo@mpdarshan.in / password123</p>
      </form>
    </div>
  );
}

function UploadPanel({ onClose, onCreated }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const result = await api.createPlace(formData);
      onCreated(result.place);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay">
      <form className="upload-card" onSubmit={submit}>
        <div className="form-title">
          <div>
            <p className="mini">जन भागीदारी</p>
            <h2>Add complete multimedia guide</h2>
          </div>
          <button onClick={onClose} type="button">Close</button>
        </div>
        <div className="grid-two">
          <label>Place name<input name="title" required placeholder="Example: तामिया हिल व्यू" /></label>
          <label>District<input name="district" required list="districts" placeholder="Chhindwara" /></label>
          <label>Category<select name="category" required>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Best time<input name="bestTime" placeholder="October to February" /></label>
          <label>Latitude<input name="latitude" required type="number" step="0.000001" placeholder="22.344" /></label>
          <label>Longitude<input name="longitude" required type="number" step="0.000001" placeholder="78.669" /></label>
          <label>Visit duration<input name="durationMinutes" min="5" max="240" type="number" placeholder="45" /></label>
          <label>Video URL<input name="videoUrl" placeholder="YouTube/embed URL or /sample-guide-video.html" /></label>
        </div>
        <datalist id="districts">{DISTRICTS.map((item) => <option key={item} value={item} />)}</datalist>
        <label>Panorama image<input name="panorama" required type="file" accept="image/*" /></label>
        <label>Photographs<input name="photos" multiple type="file" accept="image/*" /></label>
        <label>Experience<textarea name="story" required minLength={20} placeholder="Write road condition, what is special, nearby food, timing..." /></label>
        <label>Historical information<textarea name="history" required minLength={20} placeholder="Write historical/cultural/natural significance..." /></label>
        <label>Audio guide script<textarea name="audioGuide" placeholder="Optional narration script. If blank, backend generates from story/history." /></label>
        <div className="grid-two">
          <label>Local food<textarea name="localFood" placeholder="Nearby food or local speciality" /></label>
          <label>Travel tip<textarea name="travelTip" placeholder="Short practical tip for tourists" /></label>
          <label>Safety note<textarea name="safetyNote" placeholder="Road/slope/weather/safety advice" /></label>
          <label>Accessibility<textarea name="accessibility" placeholder="Road, walking level, wheelchair/elderly note" /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="primary full" disabled={saving} type="submit">{saving ? "Saving..." : "Publish guide"}</button>
      </form>
    </div>
  );
}

function GuideTabs({ activeTab, setActiveTab }) {
  return (
    <div className="guide-tabs">
      {GUIDE_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <Icon size={16} /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function GuidePanel({ activeTab, guide, place, places }) {
  if (!place) {
    return null;
  }

  if (activeTab === "photos") {
    return <Gallery place={place} />;
  }

  if (activeTab === "video") {
    return <VideoGuide place={place} />;
  }

  if (activeTab === "history") {
    return <StoryGuide guide={guide} place={place} />;
  }

  if (activeTab === "audio") {
    return <AudioGuide text={guide?.audioGuide || place.audioGuide} />;
  }

  if (activeTab === "graphics") {
    return <CGAnimationLab guide={guide} place={place} places={places} />;
  }

  return <PanoramaViewer place={place} />;
}

function App() {
  const [screen, setScreen] = useState("home");
  const [places, setPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [guide, setGuide] = useState(null);
  const [guideTab, setGuideTab] = useState("pano");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [user, setUser] = useState(getSavedUser());
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selected = places.find((place) => place.id === selectedId) ?? places[0];

  async function loadPlaces(filters = {}) {
    setLoading(true);
    setError("");
    try {
      const data = await api.getPlaces(filters);
      setPlaces(data.places);
      if (data.places.length && !data.places.some((place) => place.id === selectedId)) {
        setSelectedId(data.places[0].id);
      }
    } catch (err) {
      setError(err.message || "Could not load places.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    if (!selected?.id) {
      setGuide(null);
      return;
    }

    api.getGuide(selected.id)
      .then((data) => {
        setGuide(data.guide);
      })
      .catch(() => {
        setGuide(null);
      });
  }, [selected?.id]);

  const stats = useMemo(() => {
    const districts = new Set(places.map((place) => place.district));
    const photos = places.reduce((total, place) => total + (place.gallery?.length ?? 0), 0);
    return { districts: districts.size, photos, places: places.length };
  }, [places]);

  async function searchPlaces(event) {
    event.preventDefault();
    await loadPlaces({ category, district, q: query });
    setScreen("explore");
  }

  async function submitComment() {
    if (!comment.trim() || !selected) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    await api.addComment(selected.id, comment.trim());
    setComment("");
    await loadPlaces({ category, district, q: query });
  }

  function openUpload() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setUploadOpen(true);
  }

  function afterCreate(place) {
    setPlaces([place, ...places]);
    setSelectedId(place.id);
    setGuideTab("pano");
    setScreen("explore");
  }

  return (
    <main>
      <header className="gov-strip">
        <span>मध्य प्रदेश शासन शैली पर्यटन मार्गदर्शिका</span>
        <span>Free community tourism platform • Multimedia guide</span>
      </header>
      <nav className="navbar">
        <button className="logo-block" onClick={() => setScreen("home")} type="button">
          <img src="/mp-tourism-logo.svg" alt="मध्य प्रदेश दर्शन 360" />
          <span><strong>मध्य प्रदेश दर्शन 360</strong><small>Interactive Tourism Guide</small></span>
        </button>
        <div className="nav-actions">
          <button onClick={() => setScreen("home")} type="button">Home</button>
          <button onClick={() => setScreen("explore")} type="button">Explore Map</button>
          <button className="primary" onClick={openUpload} type="button"><Upload size={17} /> Add Guide</button>
          {user ? (
            <button onClick={() => { clearSession(); setUser(null); }} type="button"><LogOut size={16} /> {user.name}</button>
          ) : (
            <button onClick={() => setAuthOpen(true)} type="button">Login</button>
          )}
        </div>
      </nav>

      {screen === "home" ? (
        <section className="hero">
          <div className="hero-copy">
            <p className="mini">Problem statement 16 • Interactive Tourism Guide</p>
            <h1>मध्य प्रदेश की छुपी जगहों को multimedia story में खोजिए.</h1>
            <p>
              A full tourism guide where users select a location and view 360
              panoramas, photographs, maps, video stories, historical information,
              animations, audio narration, comments, and practical travel notes.
            </p>
            <form className="quick-search" onSubmit={searchPlaces}>
              <Search size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search waterfall, Mandu, heritage, Tamia..." />
              <button className="primary" type="submit">Search</button>
            </form>
            <div className="hero-buttons">
              <button className="primary" onClick={() => setScreen("explore")} type="button"><MapPin size={18} /> Explore MP Map</button>
              <button onClick={openUpload} type="button"><Upload size={18} /> Share a guide</button>
            </div>
          </div>
          <div className="hero-card">
            <GuideTabs activeTab={guideTab} setActiveTab={setGuideTab} />
            <GuidePanel activeTab={guideTab} guide={guide} place={selected} places={places} />
            <div className="hero-card-footer">
              <span><Eye size={16} /> {stats.places} locations</span>
              <span><ImageIcon size={16} /> {stats.photos} photos</span>
              <span><Landmark size={16} /> {stats.districts} districts</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="explore-page">
          <div className="section-heading">
            <div>
              <p className="mini">Explore Madhya Pradesh</p>
              <h1>Real latitude-longitude based interactive map</h1>
            </div>
            <button className="primary" onClick={openUpload} type="button"><Upload size={17} /> Add Guide</button>
          </div>
          <form className="filters" onSubmit={searchPlaces}>
            <label><Search size={16} /> <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, district, history, story..." /></label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">All districts</option>
              {DISTRICTS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="primary" type="submit">Apply Search</button>
          </form>
          {error && <p className="error inline-error">{error}</p>}
          <div className="workspace">
            <aside className="places-list">
              {loading ? <p>Loading places...</p> : places.map((place) => (
                <button key={place.id} className={selected?.id === place.id ? "place-item active" : "place-item"} onClick={() => { setSelectedId(place.id); setGuideTab("pano"); }} type="button">
                  <strong>{place.title}</strong>
                  <span>{place.district} • {place.category}</span>
                  <small>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)} • {place.durationMinutes} min</small>
                </button>
              ))}
            </aside>
            <section className="map-card">
              <MapContainer center={MP_CENTER} zoom={6} minZoom={5} maxBounds={MP_BOUNDS} scrollWheelZoom className="leaflet-map">
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FitToPlaces places={places} />
                {places.map((place) => (
                  <CircleMarker key={place.id} center={[place.latitude, place.longitude]} radius={selected?.id === place.id ? 11 : 8} pathOptions={{ color: selected?.id === place.id ? "#a3271b" : "#1f6b45", fillOpacity: 0.85 }} eventHandlers={{ click: () => { setSelectedId(place.id); setGuideTab("pano"); } }}>
                    <Popup><strong>{place.title}</strong><br />{place.district}<br />{place.category}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </section>
            <article className="detail-card">
              {selected && (
                <>
                  <GuideTabs activeTab={guideTab} setActiveTab={setGuideTab} />
                  <GuidePanel activeTab={guideTab} guide={guide} place={selected} places={places} />
                  <div className="detail-body">
                    <p className="mini">{selected.district} • {selected.category}</p>
                    <h2>{selected.title}</h2>
                    <p>{selected.story}</p>
                    <div className="detail-grid">
                      <span>Lat: {selected.latitude.toFixed(5)}</span>
                      <span>Lng: {selected.longitude.toFixed(5)}</span>
                      <span>Duration: {selected.durationMinutes} min</span>
                      <span>By: {selected.author.name}</span>
                    </div>
                    {selected.travelTip && <p className="tip"><Compass size={16} /> {selected.travelTip}</p>}
                    <div className="comment-area">
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment, travel tip, route condition..." />
                      <button className="primary" onClick={submitComment} type="button">Post Comment</button>
                    </div>
                    <div className="comments">
                      {selected.comments.map((item) => (
                        <p key={item.id}><strong>{item.author.name}:</strong> {item.body}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </article>
          </div>
        </section>
      )}

      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onLogin={setUser} />}
      {uploadOpen && <UploadPanel onClose={() => setUploadOpen(false)} onCreated={afterCreate} />}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
