/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, Eye, Binoculars, Telescope, Grid3X3, Sparkles, SunDim, Share2 } from 'lucide-react';

type ObservationMode = 'NakedEye' | 'Binoculars' | 'Telescope';

const STAR_COUNT = 40000;
const SPECTRAL_COLORS = ['#9bb0ff', '#aabfff', '#ffffff', '#fff4e8', '#fff4e8', '#ffddb4', '#ffbd6f'];

const CONSTELLATIONS = [
  {
    name: "Orion",
    stars: [
      { ra: 5.91, dec: 7.4 },   // 0: Betelgeuse
      { ra: 5.41, dec: 6.34 },  // 1: Bellatrix
      { ra: 5.53, dec: -0.29 }, // 2: Mintaka
      { ra: 5.6, dec: -1.2 },   // 3: Alnilam
      { ra: 5.67, dec: -1.94 }, // 4: Alnitak
      { ra: 5.8, dec: -9.66 },  // 5: Saiph
      { ra: 5.24, dec: -8.2 },  // 6: Rigel
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [0, 4]]
  },
  {
    name: "Ursa Major",
    stars: [
      { ra: 11.06, dec: 61.75 }, // 0: Dubhe
      { ra: 11.03, dec: 56.38 }, // 1: Merak
      { ra: 11.89, dec: 53.69 }, // 2: Phecda
      { ra: 12.25, dec: 57.03 }, // 3: Megrez
      { ra: 12.9, dec: 55.95 },  // 4: Alioth
      { ra: 13.39, dec: 54.92 }, // 5: Mizar
      { ra: 13.79, dec: 49.31 }, // 6: Alkaid
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]]
  },
  {
    name: "Cassiopeia",
    stars: [
      { ra: 0.15, dec: 59.14 }, // 0: Caph
      { ra: 0.67, dec: 56.53 }, // 1: Schedar
      { ra: 0.94, dec: 60.71 }, // 2: Gamma Cas
      { ra: 1.43, dec: 60.23 }, // 3: Ruchbah
      { ra: 1.9, dec: 63.67 },  // 4: Segin
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
  },
  {
    name: "Crux",
    stars: [
      { ra: 12.44, dec: -63.1 }, // 0: Acrux
      { ra: 12.78, dec: -59.68 }, // 1: Mimosa
      { ra: 12.52, dec: -57.11 }, // 2: Gacrux
      { ra: 12.25, dec: -58.74 }, // 3: Delta Cru
    ],
    lines: [[0, 2], [1, 3]]
  },
  {
    name: "Scorpius",
    stars: [
      { ra: 16.49, dec: -26.43 }, // 0: Antares
      { ra: 16.08, dec: -22.62 }, // 1: Dschubba
      { ra: 15.98, dec: -19.8 },  // 2: Graffias
      { ra: 17.55, dec: -37.1 },  // 3: Shaula
      { ra: 17.62, dec: -43.0 },  // 4: Sargas
      { ra: 16.84, dec: -34.29 }, // 5: Wei
    ],
    lines: [[2, 1], [1, 0], [0, 5], [5, 4], [4, 3]]
  },
  {
    name: "Cygnus",
    stars: [
      { ra: 20.69, dec: 45.28 }, // 0: Deneb
      { ra: 20.37, dec: 40.25 }, // 1: Sadr
      { ra: 19.51, dec: 27.95 }, // 2: Albireo
      { ra: 19.75, dec: 45.12 }, // 3: Delta Cyg
      { ra: 20.8, dec: 33.96 },  // 4: Gienah
    ],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]]
  },
  {
    name: "Leo",
    stars: [
      { ra: 10.13, dec: 11.96 }, // 0: Regulus
      { ra: 10.33, dec: 19.84 }, // 1: Algieba
      { ra: 11.23, dec: 20.52 }, // 2: Zosma
      { ra: 11.81, dec: 14.57 }, // 3: Denebola
      { ra: 9.88, dec: 23.77 },  // 4: Rasalas
      { ra: 10.27, dec: 23.41 }, // 5: Adhafera
    ],
    lines: [[0, 1], [1, 5], [5, 4], [1, 2], [2, 3]]
  },
  {
    name: "Taurus",
    stars: [
      { ra: 4.59, dec: 16.5 },  // 0: Aldebaran
      { ra: 5.43, dec: 28.6 },  // 1: Elnath
      { ra: 3.78, dec: 24.11 }, // 2: Alcyone
      { ra: 4.32, dec: 15.62 }, // 3: Gamma Tau
      { ra: 5.62, dec: 21.14 }, // 4: Zeta Tau
    ],
    lines: [[0, 3], [0, 1], [0, 4], [3, 2]]
  },
  {
    name: "Canis Major",
    stars: [
      { ra: 6.75, dec: -16.71 }, // 0: Sirius
      { ra: 6.37, dec: -30.06 }, // 1: Mirzam
      { ra: 6.98, dec: -28.97 }, // 2: Adhara
      { ra: 7.14, dec: -26.39 }, // 3: Wezen
      { ra: 7.4, dec: -29.3 },   // 4: Aludra
    ],
    lines: [[0, 1], [0, 3], [1, 2], [2, 3], [3, 4]]
  },
  {
    name: "Gemini",
    stars: [
      { ra: 7.58, dec: 31.88 }, // 0: Castor
      { ra: 7.75, dec: 28.02 }, // 1: Pollux
      { ra: 6.62, dec: 16.39 }, // 2: Alhena
      { ra: 7.34, dec: 21.97 }, // 3: Wasat
      { ra: 6.38, dec: 22.5 },  // 4: Tejat
    ],
    lines: [[0, 4], [1, 3], [3, 2]]
  }
];

// Deep Sky Objects (DSOs) - Nebulas, Galaxies, Clusters
const DEEP_SKY_OBJECTS = [
  { name: "Andromeda Galaxy (M31)", ra: 0.71, dec: 41.26, type: 'galaxy', color: '#aabfff', size: 18, mag: 3.4 },
  { name: "Orion Nebula (M42)", ra: 5.58, dec: -5.39, type: 'nebula', color: '#ff99cc', size: 14, mag: 4.0 },
  { name: "Pleiades (M45)", ra: 3.78, dec: 24.11, type: 'cluster', color: '#9bb0ff', size: 16, mag: 1.6 },
  { name: "Lagoon Nebula (M8)", ra: 18.06, dec: -24.38, type: 'nebula', color: '#ff77aa', size: 12, mag: 6.0 },
  { name: "Triangulum Galaxy (M33)", ra: 1.56, dec: 30.66, type: 'galaxy', color: '#ccccff', size: 15, mag: 5.7 }
];

// Performance Optimization: Using Typed Arrays (SoA - Structure of Arrays) 
// to maximize CPU cache hits, eliminate garbage collection overhead, and maximize FPS.
function initializeStarData(
  positions: Float32Array, 
  props: Float32Array, 
  colors: Uint8Array
) {
  for (let i = 0; i < STAR_COUNT; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    
    let phi = Math.acos(2 * v - 1);
    
    if (Math.random() < 0.6) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      phi = Math.PI / 2 + z0 * 0.15;
    }
    
    positions[i * 3] = Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.cos(phi);
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta);
    
    const r = Math.random();
    let magnitude;
    if (r < 0.05) {
      magnitude = Math.random() * 3.5;
    } else if (r < 0.30) {
      magnitude = 3.5 + Math.random() * 3.0;
    } else {
      magnitude = 6.5 + Math.random() * 3.5;
    }
    
    props[i * 2] = magnitude;
    props[i * 2 + 1] = Math.max(0.2, 2.5 - magnitude * 0.2);
    colors[i] = Math.floor(Math.random() * SPECTRAL_COLORS.length);
  }
}

const renderCanvas = (
  ctx: CanvasRenderingContext2D, 
  positions: Float32Array,
  props: Float32Array,
  colors: Uint8Array,
  mode: ObservationMode, 
  rotationAngle: number, 
  width: number, 
  height: number,
  gridVisible: boolean,
  lightPollution: number,
  constellationsVisible: boolean
) => {
  // Realistic Sky Glow Gradient (Light Pollution)
  // Zenith (Top of sky)
  const zR = Math.floor(2 + lightPollution * 25);
  const zG = Math.floor(5 + lightPollution * 33);
  const zB = Math.floor(15 + lightPollution * 45);
  
  // Mid-sky (Transition zone)
  const mR = Math.floor(8 + lightPollution * 65);
  const mG = Math.floor(12 + lightPollution * 55);
  const mB = Math.floor(25 + lightPollution * 45);

  // Horizon (Bottom of sky - strong sodium/LED city glow)
  const hR = Math.floor(12 + lightPollution * 160);
  const hG = Math.floor(18 + lightPollution * 100);
  const hB = Math.floor(35 + lightPollution * 60);

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, `rgb(${zR}, ${zG}, ${zB})`);
  bgGradient.addColorStop(0.4, `rgb(${mR}, ${mG}, ${mB})`);
  bgGradient.addColorStop(1, `rgb(${hR}, ${hG}, ${hB})`);
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  const fov = Math.min(width, height) * 0.9;
  const cosA = Math.cos(rotationAngle);
  const sinA = Math.sin(rotationAngle);
  
  if (gridVisible) {
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    
    const drawSegment = (p1: {x:number, y:number, z:number}, p2: {x:number, y:number, z:number}) => {
      const rx1 = p1.x * cosA - p1.z * sinA;
      const rz1 = p1.x * sinA + p1.z * cosA;
      const ry1 = p1.y;
      
      const rx2 = p2.x * cosA - p2.z * sinA;
      const rz2 = p2.x * sinA + p2.z * cosA;
      const ry2 = p2.y;
      
      if (rz1 > 0 && rz2 > 0) {
        const sx1 = width / 2 + (rx1 / rz1) * fov;
        const sy1 = height / 2 - (ry1 / rz1) * fov;
        const sx2 = width / 2 + (rx2 / rz2) * fov;
        const sy2 = height / 2 - (ry2 / rz2) * fov;
        
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
    };

    for (let i = 0; i < 24; i++) {
      const ra = (i * Math.PI) / 12;
      for (let j = -85; j < 85; j += 5) {
        const dec1 = (j * Math.PI) / 180;
        const dec2 = ((j + 5) * Math.PI) / 180;
        drawSegment(
          { x: Math.cos(dec1) * Math.cos(ra), y: Math.sin(dec1), z: Math.cos(dec1) * Math.sin(ra) },
          { x: Math.cos(dec2) * Math.cos(ra), y: Math.sin(dec2), z: Math.cos(dec2) * Math.sin(ra) }
        );
      }
    }
    
    for (let j = -8; j <= 8; j++) {
      const dec = (j * Math.PI) / 18;
      for (let i = 0; i < 72; i++) {
        const ra1 = (i * Math.PI) / 36;
        const ra2 = ((i + 1) * Math.PI) / 36;
        drawSegment(
          { x: Math.cos(dec) * Math.cos(ra1), y: Math.sin(dec), z: Math.cos(dec) * Math.sin(ra1) },
          { x: Math.cos(dec) * Math.cos(ra2), y: Math.sin(dec), z: Math.cos(dec) * Math.sin(ra2) }
        );
      }
    }
  }

  let visibleCount = 0;
  
  // Apply light pollution penalty to magnitude limit
  // High pollution (1) reduces visibility by up to 4 magnitudes
  const pollutionPenalty = lightPollution * 4.0;
  
  const baseMagLimit = mode === 'NakedEye' ? 3.5 : mode === 'Binoculars' ? 6.5 : 10;
  const magLimit = Math.max(0, baseMagLimit - pollutionPenalty);
  
  // Light pollution washes out faint stars by reducing contrast
  const brightnessMultiplier = (mode === 'NakedEye' ? 0.8 : mode === 'Binoculars' ? 1.2 : 1.5) * (1 - lightPollution * 0.3);
  const halfW = width / 2;
  const halfH = height / 2;
  
  const minDim = Math.min(width, height);
  let fovRadius = Infinity;
  if (mode === 'Binoculars') fovRadius = minDim * 0.38;
  if (mode === 'Telescope') fovRadius = minDim * 0.18;
  const fovRadiusSq = fovRadius * fovRadius;

  for (let i = 0; i < STAR_COUNT; i++) {
    const mag = props[i * 2];
    if (mag > magLimit) continue;
    
    const px = positions[i * 3];
    const py = positions[i * 3 + 1];
    const pz = positions[i * 3 + 2];
    
    const rx = px * cosA - pz * sinA;
    const rz = px * sinA + pz * cosA;
    
    if (rz > 0) {
      const screenX = halfW + (rx / rz) * fov;
      const screenY = halfH - (py / rz) * fov;
      
      if (screenX >= -10 && screenX <= width + 10 && screenY >= -10 && screenY <= height + 10) {
        const dx = screenX - halfW;
        const dy = screenY - halfH;
        if (dx * dx + dy * dy <= fovRadiusSq) {
          visibleCount++;
        }
        
        const baseSize = props[i * 2 + 1];
        const size = baseSize * (fov / 800) * brightnessMultiplier;
        const alpha = Math.max(0.1, 1 - (mag / magLimit));
        const colorStr = SPECTRAL_COLORS[colors[i]];
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colorStr;
        
        if (size < 1.2) {
          ctx.fillRect(screenX, screenY, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
          ctx.fill();
          
          if (mag < 2) {
            ctx.beginPath();
            const haloSize = size * (mode === 'Telescope' ? 2 : 3);
            ctx.arc(screenX, screenY, haloSize, 0, 2 * Math.PI);
            const haloGradient = ctx.createRadialGradient(screenX, screenY, size, screenX, screenY, haloSize);
            haloGradient.addColorStop(0, `${colorStr}88`);
            haloGradient.addColorStop(1, `${colorStr}00`);
            ctx.fillStyle = haloGradient;
            ctx.fill();
          }
        }
      }
    }
  }
  ctx.globalAlpha = 1;
  
  // Render Deep Sky Objects (DSOs)
  // These are faint to the naked eye but pop out in Binoculars/Telescope mode
  ctx.globalCompositeOperation = 'screen'; // Additive blending for glowing effect
  
  DEEP_SKY_OBJECTS.forEach(dso => {
    const raRad = (dso.ra / 24) * Math.PI * 2;
    const decRad = (dso.dec / 180) * Math.PI;
    const phi = Math.PI / 2 - decRad;
    const theta = raRad;
    
    const cx = Math.sin(phi) * Math.cos(theta);
    const cy = Math.cos(phi);
    const cz = Math.sin(phi) * Math.sin(theta);
    
    const rx = cx * cosA - cz * sinA;
    const rz = cx * sinA + cz * cosA;
    const ry = cy;
    
    if (rz > 0) {
      const screenX = halfW + (rx / rz) * fov;
      const screenY = halfH - (ry / rz) * fov;
      
      // Only render if roughly on screen
      if (screenX >= -100 && screenX <= width + 100 && screenY >= -100 && screenY <= height + 100) {
        const dx = screenX - halfW;
        const dy = screenY - halfH;
        
        // Check if inside FOV
        if (dx * dx + dy * dy <= fovRadiusSq) {
          const effectiveMag = dso.mag + pollutionPenalty;
          
          let visibility = 0;
          let scale = 1;
          
          if (mode === 'NakedEye') {
             visibility = Math.max(0, 1 - (effectiveMag / 4.5)); // Very faint
             scale = 0.5;
          } else if (mode === 'Binoculars') {
             visibility = Math.max(0, 1 - (effectiveMag / 8.0)); // Brighter
             scale = 1.8;
          } else { // Telescope
             visibility = Math.max(0, 1 - (effectiveMag / 12.0)); // Brightest
             scale = 3.5;
          }

          if (visibility > 0.05) {
            const baseSize = dso.size * (fov / 800) * scale;
            
            // Draw the glowing smudge
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, baseSize);
            const alphaCenter = Math.floor(visibility * 255).toString(16).padStart(2, '0');
            const alphaMid = Math.floor(visibility * 100).toString(16).padStart(2, '0');
            
            gradient.addColorStop(0, `${dso.color}${alphaCenter}`);
            gradient.addColorStop(0.4, `${dso.color}${alphaMid}`);
            gradient.addColorStop(1, `${dso.color}00`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Galaxies are elliptical, nebulas/clusters are rounder
            if (dso.type === 'galaxy') {
              ctx.ellipse(screenX, screenY, baseSize, baseSize * 0.5, Math.PI / 6, 0, Math.PI * 2);
            } else {
              ctx.arc(screenX, screenY, baseSize, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Draw label if visible enough and in telescope/binocular mode
            if (visibility > 0.4 && mode !== 'NakedEye') {
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = `rgba(255, 255, 255, ${visibility * 0.8})`;
              ctx.font = 'italic 11px Inter, sans-serif';
              ctx.fillText(dso.name, screenX + baseSize * 0.8, screenY - baseSize * 0.8);
              ctx.globalCompositeOperation = 'screen';
            }
          }
        }
      }
    }
  });
  
  ctx.globalCompositeOperation = 'source-over'; // Reset blending mode

  if (constellationsVisible) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)'; // Indigo-400 with opacity
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'left';

    CONSTELLATIONS.forEach(constellation => {
      const projectedStars = constellation.stars.map(star => {
        const raRad = (star.ra / 24) * Math.PI * 2;
        const decRad = (star.dec / 180) * Math.PI;
        const phi = Math.PI / 2 - decRad;
        const theta = raRad;
        
        const cx = Math.sin(phi) * Math.cos(theta);
        const cy = Math.cos(phi);
        const cz = Math.sin(phi) * Math.sin(theta);
        
        const rx = cx * cosA - cz * sinA;
        const rz = cx * sinA + cz * cosA;
        const ry = cy;
        
        if (rz > 0) {
          const screenX = halfW + (rx / rz) * fov;
          const screenY = halfH - (ry / rz) * fov;
          // Only render if roughly on screen
          if (screenX >= -50 && screenX <= width + 50 && screenY >= -50 && screenY <= height + 50) {
            return { x: screenX, y: screenY, visible: true };
          }
        }
        return { x: 0, y: 0, visible: false };
      });

      // Draw lines
      ctx.beginPath();
      constellation.lines.forEach(([i, j]) => {
        const p1 = projectedStars[i];
        const p2 = projectedStars[j];
        if (p1.visible && p2.visible) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      });
      ctx.stroke();

      // Draw stars and labels
      let labelDrawn = false;
      projectedStars.forEach((p, i) => {
        if (p.visible) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          
          if (!labelDrawn) {
            ctx.fillStyle = 'rgba(165, 180, 252, 0.9)'; // Indigo-300
            ctx.fillText(constellation.name, p.x + 8, p.y - 8);
            labelDrawn = true;
          }
        }
      });
    });
  }

  // Draw the instrument eyepiece mask
  if (mode !== 'NakedEye') {
    // Darken outside the FOV
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(halfW, halfH, fovRadius, 0, Math.PI * 2, true);
    ctx.fill();
    
    // Eyepiece border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(halfW, halfH, fovRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner shadow for depth
    const innerGlow = ctx.createRadialGradient(halfW, halfH, fovRadius - 15, halfW, halfH, fovRadius);
    innerGlow.addColorStop(0, 'rgba(0,0,0,0)');
    innerGlow.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(halfW, halfH, fovRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return visibleCount;
};

export default function App() {
  const [mode, setMode] = useState<ObservationMode>('NakedEye');
  const [isRotating, setIsRotating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);
  const [constellationsVisible, setConstellationsVisible] = useState(false);
  const [lightPollution, setLightPollution] = useState(0); // 0 = Dark Sky, 1 = City Sky
  const [skyGlowMenuOpen, setSkyGlowMenuOpen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const requestRef = useRef<number>();
  
  // High-Performance Typed Array Refs
  const positionsRef = useRef<Float32Array>(new Float32Array(STAR_COUNT * 3));
  const propsRef = useRef<Float32Array>(new Float32Array(STAR_COUNT * 2));
  const colorsRef = useRef<Uint8Array>(new Uint8Array(STAR_COUNT));
  
  const lastRenderRef = useRef({ mode: '', rotation: -1, width: 0, height: 0, grid: false, pollution: -1, constellations: false });
  const angleDisplayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    initializeStarData(positionsRef.current, propsRef.current, colorsRef.current);
    lastRenderRef.current.rotation = -1; 
  }, []);

  const animate = useCallback((time: number) => {
    if (isRotating) {
      rotationRef.current += 0.002; // Increased speed for visible rotation
    }
    
    if (angleDisplayRef.current) {
      const degrees = ((rotationRef.current * 180) / Math.PI) % 360;
      const displayDeg = degrees < 0 ? degrees + 360 : degrees;
      angleDisplayRef.current.innerText = displayDeg.toFixed(1) + '°';
    }
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const needsResize = canvas.width !== rect.width || canvas.height !== rect.height;
      
      if (needsResize) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
      
      const needsRedraw = 
        needsResize || 
        isRotating || 
        lastRenderRef.current.mode !== mode || 
        lastRenderRef.current.rotation !== rotationRef.current ||
        lastRenderRef.current.grid !== gridVisible ||
        lastRenderRef.current.pollution !== lightPollution ||
        lastRenderRef.current.constellations !== constellationsVisible;

      if (needsRedraw) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const count = renderCanvas(
            ctx, 
            positionsRef.current, 
            propsRef.current, 
            colorsRef.current, 
            mode, 
            rotationRef.current, 
            rect.width, 
            rect.height, 
            gridVisible,
            lightPollution,
            constellationsVisible
          );
          setVisibleCount(count);
          
          lastRenderRef.current = {
            mode,
            rotation: rotationRef.current,
            width: rect.width,
            height: rect.height,
            grid: gridVisible,
            pollution: lightPollution,
            constellations: constellationsVisible
          };
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(animate);
  }, [isRotating, mode, gridVisible, lightPollution, constellationsVisible]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleReset = () => {
    rotationRef.current = 0;
    lastRenderRef.current.rotation = -1; // Force redraw
    if (angleDisplayRef.current) {
      angleDisplayRef.current.innerText = '0.0°';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen && !(e.target as Element).closest('.mode-selector-container')) {
        setMenuOpen(false);
      }
      if (skyGlowMenuOpen && !(e.target as Element).closest('.skyglow-container')) {
        setSkyGlowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, skyGlowMenuOpen]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-indigo-500/30">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-[74px] md:h-[90px] bg-slate-950/40 backdrop-blur-md border-b border-slate-800/50 flex items-center px-4 md:px-8 z-20 transition-all">
        <div className="flex items-center gap-3 mr-6 md:mr-10">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-semibold text-lg md:text-xl tracking-tight hidden sm:block text-slate-100">Stellar<span className="text-indigo-400">Sight</span></span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setGridVisible(!gridVisible)}
            className={`flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-full transition-all border shadow-sm ${gridVisible ? 'bg-indigo-600/80 border-indigo-500/50 text-white shadow-indigo-900/50' : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/50 text-slate-200'}`}
            aria-label="Toggle Grid"
          >
            <Grid3X3 size={18} />
            <span className="text-sm font-medium hidden sm:block">Grid</span>
          </button>

          <button 
            onClick={() => setConstellationsVisible(!constellationsVisible)}
            className={`flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-full transition-all border shadow-sm ${constellationsVisible ? 'bg-indigo-600/80 border-indigo-500/50 text-white shadow-indigo-900/50' : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/50 text-slate-200'}`}
            aria-label="Toggle Constellations"
          >
            <Share2 size={18} />
            <span className="text-sm font-medium hidden sm:block">Constellations</span>
          </button>

          <button 
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-full transition-all border shadow-sm ${isRotating ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/50 text-slate-200'}`}
            aria-label={isRotating ? "Pause Rotation" : "Play Rotation"}
          >
            {isRotating ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-sm font-medium hidden sm:block">{isRotating ? 'Pause' : 'Play'}</span>
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700/80 transition-all border border-slate-700/50 text-slate-200 shadow-sm hover:shadow-md"
            aria-label="Reset View"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium hidden sm:block">Reset</span>
          </button>

          <div className="w-px h-6 bg-slate-700/50 mx-1 md:mx-2 hidden sm:block"></div>

          {/* Light Pollution Slider Toggle */}
          <div className="relative skyglow-container">
            <button 
              onClick={() => setSkyGlowMenuOpen(!skyGlowMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all border shadow-sm ${skyGlowMenuOpen || lightPollution > 0 ? 'bg-indigo-600/80 border-indigo-500/50 text-white shadow-indigo-900/50' : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/50 text-slate-200'}`}
              aria-label="Toggle Sky Glow Menu"
            >
              <SunDim size={18} />
              <span className="text-sm font-medium hidden sm:block">Sky Glow</span>
            </button>
            
            {/* Dropdown Slider */}
            <div className={`absolute top-full right-0 mt-3 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-200 origin-top-right ${skyGlowMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
              <div className="flex flex-col gap-3 min-w-[160px]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Light Pollution</span>
                  <span className="text-xs font-mono text-indigo-300">{Math.round(lightPollution * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={lightPollution}
                  onChange={(e) => setLightPollution(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  title="Adjust Light Pollution"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Star Count Indicator */}
      <div className="absolute top-[90px] md:top-[106px] right-4 md:right-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-3 py-1 md:px-4 md:py-2 shadow-2xl z-20 flex flex-col items-end transition-all">
        <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Stars Visible</span>
        <span className="text-2xl md:text-4xl font-mono font-light text-indigo-50 tracking-tight">
          {visibleCount.toLocaleString()}
        </span>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50 w-full justify-end">
          <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-widest">Angle</span>
          <span ref={angleDisplayRef} className="text-sm md:text-base font-mono font-light text-indigo-200 tracking-tight">
            0.0°
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-6 py-[34px] md:px-8 md:py-[42px] flex justify-center z-20 pointer-events-none bg-gradient-to-t from-slate-950/80 to-transparent">
        <div className="relative pointer-events-auto mode-selector-container">
          {/* Menu */}
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
            <div className="p-2 flex flex-col gap-1">
              <ModeOption 
                icon={<Eye size={22} />} 
                title="Naked Eye" 
                desc="Brightest stars only" 
                active={mode === 'NakedEye'} 
                onClick={() => { setMode('NakedEye'); setMenuOpen(false); }} 
              />
              <ModeOption 
                icon={<Binoculars size={22} />} 
                title="Binoculars" 
                desc="Reveals fainter stars" 
                active={mode === 'Binoculars'} 
                onClick={() => { setMode('Binoculars'); setMenuOpen(false); }} 
              />
              <ModeOption 
                icon={<Telescope size={22} />} 
                title="Telescope" 
                desc="Maximum detail & density" 
                active={mode === 'Telescope'} 
                onClick={() => { setMode('Telescope'); setMenuOpen(false); }} 
              />
            </div>
          </div>
          
          {/* Main Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-4 px-6 py-3 md:px-8 md:py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 border border-indigo-400/30 group active:scale-95"
          >
            <span className="font-semibold text-sm md:text-base tracking-wide text-white">Observation Mode</span>
            <div className="flex items-center gap-2 bg-indigo-950/40 px-3 py-1.5 rounded-full border border-indigo-400/20">
              <span className="text-xs md:text-sm text-indigo-100 font-medium">{mode.replace(/([A-Z])/g, ' $1').trim()}</span>
              <ChevronUp size={16} className={`text-indigo-200 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
}

function ModeOption({ icon, title, desc, active, onClick }: { icon: React.ReactNode, title: string, desc: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors text-left ${active ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-slate-800/50 border border-transparent'}`}
    >
      <div className={`p-2 rounded-lg ${active ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <div className={`font-medium text-sm ${active ? 'text-indigo-100' : 'text-slate-200'}`}>{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
    </button>
  );
}
