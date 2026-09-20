import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { locations, type Period } from './data/locations';

type PanoramaViewerProps = {
  imageUrl: string;
  fov: number;
  resetSignal: number;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function PanoramaViewer({ imageUrl, fov, resetSignal }: PanoramaViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const photoPlaneRef = useRef<THREE.Mesh | null>(null);
  const [textureState, setTextureState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionMessage, setMotionMessage] = useState('');

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0b09);
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
    camera.position.set(0, 2.1, 2.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.domElement.className = 'panorama-canvas';
    renderer.domElement.setAttribute('aria-label', 'Sala histórica imersiva em 2.5D');
    stage.appendChild(renderer.domElement);

    const vrButton = VRButton.createButton(renderer);
    vrButton.classList.add('vr-button');
    stage.appendChild(vrButton);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.rotateSpeed = -0.18;
    controls.minAzimuthAngle = -0.65;
    controls.maxAzimuthAngle = 0.65;
    controls.minPolarAngle = 1.15;
    controls.maxPolarAngle = 1.95;
    controls.target.set(0, 2, -4.2);
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

    const roomWidth = 18;
    const roomHeight = 8;
    const roomDepth = 12;
    const roomMaterials = {
      wall: new THREE.MeshBasicMaterial({ color: 0x756552, side: THREE.DoubleSide }),
      sideWall: new THREE.MeshBasicMaterial({ color: 0x55493c, side: THREE.DoubleSide }),
      floor: new THREE.MeshBasicMaterial({ color: 0x30271f, side: THREE.DoubleSide }),
      ceiling: new THREE.MeshBasicMaterial({ color: 0x8a785f, side: THREE.DoubleSide })
    };
    const roomMeshes: THREE.Mesh[] = [];
    const addRoomPlane = (geometry: THREE.PlaneGeometry, material: THREE.MeshBasicMaterial, position: THREE.Vector3, rotation: THREE.Euler) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.rotation.copy(rotation);
      scene.add(mesh);
      roomMeshes.push(mesh);
      return mesh;
    };

    addRoomPlane(new THREE.PlaneGeometry(roomWidth, roomHeight), roomMaterials.wall, new THREE.Vector3(0, roomHeight / 2, -roomDepth / 2), new THREE.Euler());
    addRoomPlane(new THREE.PlaneGeometry(roomDepth, roomHeight), roomMaterials.sideWall, new THREE.Vector3(-roomWidth / 2, roomHeight / 2, 0), new THREE.Euler(0, Math.PI / 2, 0));
    addRoomPlane(new THREE.PlaneGeometry(roomDepth, roomHeight), roomMaterials.sideWall, new THREE.Vector3(roomWidth / 2, roomHeight / 2, 0), new THREE.Euler(0, Math.PI / 2, 0));
    addRoomPlane(new THREE.PlaneGeometry(roomWidth, roomDepth), roomMaterials.floor, new THREE.Vector3(0, 0, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
    addRoomPlane(new THREE.PlaneGeometry(roomWidth, roomDepth), roomMaterials.ceiling, new THREE.Vector3(0, roomHeight, 0), new THREE.Euler(Math.PI / 2, 0, 0));

    const photoMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    materialRef.current = photoMaterial;
    const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 7.2), photoMaterial);
    photoPlane.position.set(0, 3.9, -roomDepth / 2 + 0.02);
    scene.add(photoPlane);
    photoPlaneRef.current = photoPlane;

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      deactivateMotion();
      resizeObserver.disconnect();
      controls.dispose();
      roomMeshes.forEach((mesh) => mesh.geometry.dispose());
      Object.values(roomMaterials).forEach((material) => material.dispose());
      photoPlane.geometry.dispose();
      photoMaterial.map?.dispose();
      photoMaterial.dispose();
      renderer.dispose();
      vrButton.remove();
      renderer.domElement.remove();
      cameraRef.current = null;
      controlsRef.current = null;
      materialRef.current = null;
      photoPlaneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [fov]);

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
        material.map?.dispose();
        material.map = texture;
        const imageRatio = texture.image.width / texture.image.height;
        const photoHeight = 7.2;
        const photoWidth = Math.min(16.8, Math.max(9, photoHeight * imageRatio));
        const photoPlane = photoPlaneRef.current;
        if (photoPlane) {
          photoPlane.geometry.dispose();
          photoPlane.geometry = new THREE.PlaneGeometry(photoWidth, photoHeight);
        }
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
  const [fov, setFov] = useState(78);
  const [resetSignal, setResetSignal] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedId) ?? locations[0],
    [selectedId]
  );

  const activePanorama = selectedLocation.panoramas[period];

  const handleSelectLocation = (id: string) => {
    setSelectedId(id);
    setFov(78);
    setResetSignal((signal) => signal + 1);
    setPeriod('current');
    setIsTransitioning(false);
  };

  const handleTimeTravel = () => {
    if (isTransitioning) return;

    const nextPeriod: Period = period === 'current' ? 'historical' : 'current';
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

          <div className="city-map" aria-label="Recorte estático de Itacoatiara no Amazonas com pontos de interesse">
            <div className="map-grid" />
            <div className="map-river" />
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <span className="map-city-label">ITACOATIARA</span>
            <span className="map-state-label">AMAZONAS · BRASIL</span>
            <span className="map-north">N</span>
            <span className="map-scale">0&nbsp;&nbsp;&nbsp;&nbsp;250 m</span>

            {locations.map((location) => {
              const isSelected = location.id === selectedId;
              return (
                <button
                  key={location.id}
                  type="button"
                  className={`map-marker ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${location.coordinates.x}%`, top: `${location.coordinates.y}%` }}
                  onClick={() => handleSelectLocation(location.id)}
                  aria-label={`Selecionar ${location.name}`}
                >
                  <span className="marker-dot" />
                  <span className="marker-name">{location.name}<small>{location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}</small></span>
                </button>
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
                <p>Arraste suavemente para observar a sala e use “Resetar visão” para voltar ao enquadramento inicial.</p>
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

        <section className="viewer-panel">
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
              fov={fov}
              resetSignal={resetSignal}
            />

            <div className="viewer-overlay" aria-live="polite">
              <span className="year-pill">{activePanorama.year}</span>
              <span className="view-mode">{period === 'current' ? 'Presente' : 'Histórico'}</span>
            </div>

            {isTransitioning && (
              <div className="time-transition">
                <div className="portal-shell">
                  <span>{period === 'current' ? '1970' : '2026'}</span>
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
