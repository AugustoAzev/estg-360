import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { locations, type Period } from './data/locations';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const DEFAULT_HORIZONTAL_FOV = 90;
const MIN_HORIZONTAL_FOV = 70;
const MAX_HORIZONTAL_FOV = 105;
const HORIZONTAL_FOV_STEP = 5;

const getVerticalFov = (horizontalFov: number, aspect: number) =>
  THREE.MathUtils.radToDeg(
    2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(horizontalFov) / 2) / aspect)
  );

type PanoramaViewerProps = {
  imageUrl: string;
  horizontalFov: number;
  resetSignal: number;
  onHorizontalFovChange: (nextFov: number) => void;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function PanoramaViewer({ imageUrl, horizontalFov, resetSignal, onHorizontalFovChange }: PanoramaViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const horizontalFovRef = useRef(horizontalFov);
  const [textureState, setTextureState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionMessage, setMotionMessage] = useState('');

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(getVerticalFov(horizontalFov, 1), 1, 0.1, 200);
    camera.position.set(0, 0, 0.01);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.domElement.className = 'panorama-canvas';
    renderer.domElement.setAttribute('aria-label', 'Visualizador panorâmico 360 graus');
    stage.appendChild(renderer.domElement);

    const vrButton = VRButton.createButton(renderer);
    vrButton.classList.add('vr-button');
    stage.appendChild(vrButton);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.rotateSpeed = -0.25;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.35;
    controls.target.set(0, 0, -1);
    controls.update();
    controls.saveState();
    controlsRef.current = controls;

    const orientationEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    const orientationQuaternion = new THREE.Quaternion();
    const screenQuaternion = new THREE.Quaternion();
    const zee = new THREE.Vector3(0, 0, 1);
    const screenOrientation = () => (window.screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
    const updateOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;
      orientationEuler.set(
        THREE.MathUtils.degToRad(event.beta),
        THREE.MathUtils.degToRad(event.alpha),
        -THREE.MathUtils.degToRad(event.gamma),
        'YXZ'
      );
      orientationQuaternion.setFromEuler(orientationEuler);
      orientationQuaternion.multiply(new THREE.Quaternion().setFromAxisAngle(zee, -Math.PI / 2));
      screenQuaternion.setFromAxisAngle(zee, -screenOrientation());
      camera.quaternion.copy(orientationQuaternion).multiply(screenQuaternion);
    };

    const activateMotion = async () => {
      const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
      if (typeof orientationEvent.requestPermission === 'function') {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') {
          setMotionMessage('Permissão de movimento recusada pelo dispositivo.');
          return;
        }
      }
      window.addEventListener('deviceorientation', updateOrientation, true);
      controls.enabled = false;
      setMotionEnabled(true);
      setMotionMessage('Movimento ativo');
    };

    const deactivateMotion = () => {
      window.removeEventListener('deviceorientation', updateOrientation, true);
      controls.enabled = true;
      setMotionEnabled(false);
      setMotionMessage('');
    };
    (stage as HTMLDivElement & { activateMotion?: () => Promise<void>; deactivateMotion?: () => void }).activateMotion = activateMotion;
    (stage as HTMLDivElement & { activateMotion?: () => Promise<void>; deactivateMotion?: () => void }).deactivateMotion = deactivateMotion;

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
    materialRef.current = material;
    const panorama = new THREE.Mesh(new THREE.SphereGeometry(100, 64, 40), material);
    scene.add(panorama);

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.fov = getVerticalFov(horizontalFovRef.current, camera.aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      onHorizontalFovChange(
        clamp(
          horizontalFovRef.current + (event.deltaY > 0 ? HORIZONTAL_FOV_STEP : -HORIZONTAL_FOV_STEP),
          MIN_HORIZONTAL_FOV,
          MAX_HORIZONTAL_FOV
        )
      );
    };
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      deactivateMotion();
      resizeObserver.disconnect();
      controls.dispose();
      panorama.geometry.dispose();
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      vrButton.remove();
      renderer.domElement.remove();
      cameraRef.current = null;
      controlsRef.current = null;
      materialRef.current = null;
    };
  }, []);

  useEffect(() => {
    horizontalFovRef.current = horizontalFov;
    const camera = cameraRef.current;
    if (!camera) return;
    camera.fov = getVerticalFov(horizontalFov, camera.aspect);
    camera.updateProjectionMatrix();
  }, [horizontalFov]);

  useEffect(() => {
    controlsRef.current?.reset();
  }, [resetSignal]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    setTextureState('loading');

    loader.load(
      imageUrl,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.offset.x = 1;
        material.map?.dispose();
        material.map = texture;
        material.needsUpdate = true;
        setTextureState('ready');
      },
      undefined,
      () => {
        if (!cancelled) setTextureState('error');
      }
    );

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <div ref={stageRef} className="panorama-renderer">
      {textureState === 'loading' && <div className="viewer-status">Carregando panorama...</div>}
      {textureState === 'error' && <div className="viewer-status error">Não foi possível carregar este panorama.</div>}
      <div className="motion-controls">
        <button
          type="button"
          className="motion-button"
          onClick={async () => {
            const stage = stageRef.current as (HTMLDivElement & { activateMotion?: () => Promise<void>; deactivateMotion?: () => void }) | null;
            if (motionEnabled) stage?.deactivateMotion?.();
            else await stage?.activateMotion?.();
          }}
        >
          {motionEnabled ? 'Desativar movimento' : 'Usar movimento do celular'}
        </button>
        {motionMessage && <span className="motion-message">{motionMessage}</span>}
      </div>
    </div>
  );
}

function App() {
  const [selectedId, setSelectedId] = useState(locations[0].id);
  const [period, setPeriod] = useState<Period>('current');
  const [horizontalFov, setHorizontalFov] = useState(DEFAULT_HORIZONTAL_FOV);
  const [resetSignal, setResetSignal] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionYear, setTransitionYear] = useState<number | null>(null);
  const [mapPreviewId, setMapPreviewId] = useState<string | null>(null);
  const viewerPanelRef = useRef<HTMLElement>(null);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedId) ?? locations[0],
    [selectedId]
  );

  const activePanorama = selectedLocation.panoramas[period];

  const handleSelectLocation = (id: string) => {
    setSelectedId(id);
    setHorizontalFov(DEFAULT_HORIZONTAL_FOV);
    setResetSignal((signal) => signal + 1);
    setPeriod('current');
    setIsTransitioning(false);
  };

  const handleMapSelect = (id: string) => {
    handleSelectLocation(id);
    setMapPreviewId(id);
  };

  const handleViewLocation = (id: string) => {
    handleSelectLocation(id);
    viewerPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTimeTravel = () => {
    if (isTransitioning) return;

    const nextPeriod: Period = period === 'current' ? 'historical' : 'current';
    setTransitionYear(selectedLocation.panoramas[nextPeriod].year);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setPeriod(nextPeriod);
    }, 700);

    window.setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">360ESTG</p>
          <h1>Viagem no tempo</h1>
        </div>

        <div className="location-list" aria-label="Lista de locais históricos">
          {locations.map((location) => {
            const isSelected = location.id === selectedId;
            return (
              <button
                key={location.id}
                type="button"
                className={`location-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectLocation(location.id)}
              >
                <span className="card-index">{location.city}</span>
                <strong>{location.name}</strong>
                <small>{location.description}</small>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="content-panel">
        <section className="map-panel">
          <div className="map-header">
            <div>
              <p className="eyebrow">Recorte estático da cidade</p>
              <h2>Itacoatiara, Amazonas</h2>
            </div>
            <span className="badge">{locations.length} pontos</span>
          </div>

          <div
            className="city-map"
            aria-label="Recorte estático de Itacoatiara no Amazonas com pontos de interesse"
            onClick={() => setMapPreviewId(null)}
          >
            <div className="map-grid" />
            <div className="map-river" />
            <div className="map-blocks" aria-hidden="true">
              <i className="block block-one" />
              <i className="block block-two" />
              <i className="block block-three" />
              <i className="block block-four" />
              <i className="block block-five" />
              <i className="block block-six" />
            </div>
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <span className="map-city-label">ITACOATIARA</span>
            <span className="map-state-label">AMAZONAS · BRASIL</span>
            <span className="map-north">N</span>
            <span className="map-scale">0&nbsp;&nbsp;&nbsp;&nbsp;250 m</span>

            {locations.map((location) => {
              const isSelected = location.id === selectedId;
              return (
                <div
                  key={location.id}
                  className={`map-marker ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${location.coordinates.x}%`, top: `${location.coordinates.y}%` }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleMapSelect(location.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleMapSelect(location.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar ${location.name}`}
                >
                  <span className="marker-dot" />
                  <span className="marker-name">{location.name}<small>{location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}</small></span>
                  {mapPreviewId === location.id && (
                    <span className="marker-preview" role="dialog" aria-label={`Prévia de ${location.name}`}>
                      <img src={location.panoramas.current.imageUrl} alt={`Vista atual de ${location.name}`} />
                      <span className="marker-preview-content">
                        <strong>{location.name}</strong>
                        <button type="button" className="preview-button" onClick={(event) => { event.stopPropagation(); handleViewLocation(location.id); }}>
                          Ver
                        </button>
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="tutorial-panel">
          <div className="tutorial-header">
            <div>
              <p className="eyebrow">Como explorar</p>
              <h2>Escolha seu modo de visualização</h2>
            </div>
            <span className="badge">Guia rápido</span>
          </div>

          <div className="tutorial-grid">
            <article className="tutorial-card">
              <div className="device-figure phone-figure" aria-hidden="true">
                <span className="phone-screen"><i /><b /></span>
                <span className="motion-arrow arrow-left">↺</span>
                <span className="motion-arrow arrow-right">↻</span>
              </div>
              <div>
                <p className="eyebrow">Celular Android ou iPhone</p>
                <h3>Gire o próprio dispositivo</h3>
                <p>Toque em “Usar movimento do celular”, permita o acesso aos sensores e mova o aparelho para olhar ao redor.</p>
              </div>
            </article>

            <article className="tutorial-card">
              <div className="device-figure desktop-figure" aria-hidden="true">
                <span className="monitor-screen"><i /><i /><i /></span>
                <span className="monitor-stand" />
                <span className="mouse-shape" />
              </div>
              <div>
                <p className="eyebrow">Computador</p>
                <h3>Arraste para olhar</h3>
                <p>Use o mouse para girar a câmera, a roda para aproximar ou afastar e “Resetar visão” para voltar ao início.</p>
              </div>
            </article>

            <article className="tutorial-card">
              <div className="device-figure headset-figure" aria-hidden="true">
                <span className="headset-lens" />
                <span className="headset-lens" />
                <span className="headset-band" />
              </div>
              <div>
                <p className="eyebrow">Headset VR</p>
                <h3>Entre em realidade virtual</h3>
                <p>Conecte um headset compatível, abra em Chrome ou Edge e use o botão “Enter VR” dentro do panorama.</p>
              </div>
            </article>
          </div>
        </section>

        <section ref={viewerPanelRef} className="viewer-panel">
          <div className="viewer-toolbar">
            <div>
              <p className="eyebrow">Local atual</p>
              <h3>{selectedLocation.name}</h3>
            </div>
            <div className="toolbar-actions">
              <button type="button" className="ghost-button" onClick={() => handleSelectLocation(selectedId)}>
                Resetar visão
              </button>
              <button type="button" className="primary-button" onClick={handleTimeTravel}>
                {period === 'current' ? 'Voltar no tempo — 1970' : 'Retornar ao presente'}
              </button>
            </div>
          </div>

          <div className={`panorama-stage ${isTransitioning ? 'transitioning' : ''}`}>
            <PanoramaViewer
              imageUrl={activePanorama.imageUrl}
              horizontalFov={horizontalFov}
              resetSignal={resetSignal}
              onHorizontalFovChange={setHorizontalFov}
            />

            <div className="viewer-overlay" aria-live="polite">
              <span className="year-pill">{activePanorama.year}</span>
              <span className="view-mode">{period === 'current' ? 'Presente' : 'Histórico'}</span>
            </div>

            {isTransitioning && (
              <div className="time-transition">
                <div className="portal-shell">
                  <span>{transitionYear}</span>
                </div>
              </div>
            )}
          </div>

          <div className="source-panel">
            <div>
              <p className="eyebrow">Confiabilidade histórica</p>
              <h4>{selectedLocation.source.confidence}</h4>
            </div>
            <p>{selectedLocation.source.title}</p>
            <small>{selectedLocation.source.note}</small>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
