import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LandingPage.css';

const PIN_IMAGES = {
  band: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=80&h=80&fit=crop',
  ],
  venue: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&h=80&fit=crop',
  ],
  producer: [
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=80&h=80&fit=crop',
  ],
};

const MARKERS = [
  { lat: -23.543, lng: -46.643, type: 'band'     as const, name: 'The Garage Dogs',  info: 'Rock / Punk · Pinheiros'      },
  { lat: -23.561, lng: -46.655, type: 'band'     as const, name: 'Neon Oxálá',        info: 'MPB Eletrônico · Vila Madalena'},
  { lat: -23.548, lng: -46.618, type: 'band'     as const, name: 'Fuzz Machine',      info: 'Stoner Rock · Consolação'     },
  { lat: -23.537, lng: -46.670, type: 'venue'    as const, name: 'Espaço Z',          info: 'Casa de Show · 500 pessoas'   },
  { lat: -23.555, lng: -46.639, type: 'venue'    as const, name: 'Bunker Club',        info: 'Casa de Show · 200 pessoas'   },
  { lat: -23.569, lng: -46.648, type: 'venue'    as const, name: 'Garage Stage',       info: 'Casa de Show · 150 pessoas'   },
  { lat: -23.544, lng: -46.633, type: 'producer' as const, name: 'Studio 88',          info: 'Produtor · Rock, Pop, Indie'  },
  { lat: -23.558, lng: -46.660, type: 'producer' as const, name: 'Bass Drop Rec.',     info: 'Produtor · Eletrônico, Hip-Hop'},
];

const CONNECTIONS = [[0,3],[1,7],[2,4],[3,6],[4,0],[5,1],[6,2],[7,5]];

const COLOR_BY_TYPE = { band: '#FFD200', venue: '#FF6B00', producer: '#00E5FF' };

function makeIcon(color: string, imgUrl: string) {
  const html = `
    <div style="position:relative;width:52px;height:62px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.7))">
      <div style="position:absolute;top:0;left:0;width:52px;height:52px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid ${color};overflow:hidden;">
        <div style="position:absolute;inset:3px;border-radius:50%;overflow:hidden;transform:rotate(45deg);">
          <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous"/>
        </div>
      </div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:4px;height:14px;background:${color};border-radius:0 0 4px 4px;"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [52, 62], iconAnchor: [26, 62], popupAnchor: [0, -64] });
}

export default function LandingPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [scrolled, setScrolled] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-23.55, -46.63],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '' }).addTo(map);

    const counters = { band: 0, venue: 0, producer: 0 };
    MARKERS.forEach((m) => {
      const imgs = PIN_IMAGES[m.type];
      const imgUrl = imgs[counters[m.type] % imgs.length];
      counters[m.type]++;
      const icon = makeIcon(COLOR_BY_TYPE[m.type], imgUrl);
      L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(`<b>${m.name}</b><br>${m.info}`);
    });

    const buildLines = () => {
      const svg = svgRef.current;
      const container = mapContainerRef.current;
      if (!svg || !container) return;
      svg.innerHTML = '';
      const rect = container.getBoundingClientRect();
      svg.setAttribute('width', String(rect.width));
      svg.setAttribute('height', String(rect.height));
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);

      CONNECTIONS.forEach(([a, b], i) => {
        const pa = map.latLngToContainerPoint([MARKERS[a].lat, MARKERS[a].lng]);
        const pb = map.latLngToContainerPoint([MARKERS[b].lat, MARKERS[b].lng]);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(pa.x)); line.setAttribute('y1', String(pa.y));
        line.setAttribute('x2', String(pb.x)); line.setAttribute('y2', String(pb.y));
        line.setAttribute('stroke', '#FFD200');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('opacity', '0.35');
        svg.appendChild(line);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#FFD200');
        circle.setAttribute('opacity', '0.9');
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        anim.setAttribute('path', `M${pa.x},${pa.y} L${pb.x},${pb.y}`);
        anim.setAttribute('dur', `${2 + i * 0.4}s`);
        anim.setAttribute('begin', `${i * 0.6}s`);
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('calcMode', 'linear');
        circle.appendChild(anim);
        svg.appendChild(circle);
      });
    };

    map.whenReady(() => setTimeout(buildLines, 400));
    map.on('moveend zoomend', buildLines);
    window.addEventListener('resize', () => setTimeout(buildLines, 200));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="lp-root">
      <div className="lp-scanlines" />

      {/* NAV */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <span className="lp-nav-logo">GARAGEDOM</span>
        <ul className="lp-nav-links">
          <li><a href="#mapa">MAPA</a></li>
          <li><a href="#features">FUNCIONALIDADES</a></li>
          <li><a href="#como">COMO FUNCIONA</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="lp-hero" id="hero">
        <div className="lp-concert-bg" />
        <div className="lp-grain" />
        <div className="lp-hero-blur" />
        <div className="lp-crowd" />

        <div className="lp-hero-content">
          <div style={{ textAlign: 'center' }}>
            <div className="lp-logo-main">GARAGEDOM</div>
            <div className="lp-logo-sub">conectando a cena underground</div>
          </div>

          <div className="lp-login-card">
            <div className="lp-login-tabs">
              <button className={`lp-tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>ENTRAR</button>
              <button className={`lp-tab-btn${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>CADASTRAR</button>
            </div>

            {tab === 'login' ? (
              <div>
                <div className="lp-form-group">
                  <label>E-MAIL</label>
                  <input type="email" placeholder="seu@email.com" />
                </div>
                <div className="lp-form-group">
                  <label>SENHA</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="lp-btn-primary" onClick={() => navigate('/login')}>▶ ENTRAR</button>
              </div>
            ) : (
              <div>
                <div className="lp-form-group">
                  <label>NOME</label>
                  <input type="text" placeholder="seu nome ou banda" />
                </div>
                <div className="lp-form-group">
                  <label>TIPO DE PERFIL</label>
                  <select>
                    <option>🎸 Banda / Músico</option>
                    <option>🎙️ Produtor</option>
                    <option>🏟️ Casa de Show</option>
                  </select>
                </div>
                <div className="lp-form-group">
                  <label>E-MAIL</label>
                  <input type="email" placeholder="seu@email.com" />
                </div>
                <div className="lp-form-group">
                  <label>SENHA</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="lp-btn-primary" onClick={() => navigate('/register')}>▶ CRIAR CONTA</button>
              </div>
            )}
          </div>
        </div>

        <div className="lp-scroll-hint">
          EXPLORAR<span className="arrow">▼</span>
        </div>
      </section>

      {/* MAPA */}
      <section className="lp-mapa" id="mapa">
        <div className="lp-mapa-header">
          <div>
            <div className="lp-section-tag">MAPA DA CENA</div>
            <div className="lp-section-title">A CENA MUSICAL<br />NO SEU RADAR</div>
            <div className="lp-section-body">Encontre bandas, produtores e casas de show perto de você. Conecte, agende e faça acontecer.</div>
          </div>
          <div className="lp-map-legend">
            <div className="lp-legend-item"><div className="lp-legend-dot band" /> Bandas &amp; Músicos</div>
            <div className="lp-legend-item"><div className="lp-legend-dot venue" /> Casas de Show</div>
            <div className="lp-legend-item"><div className="lp-legend-dot producer" /> Produtores</div>
          </div>
        </div>
        <div className="lp-map-container" ref={mapContainerRef}>
          <svg className="lp-map-svg-overlay" ref={svgRef} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features" id="features">
        <div className="lp-features-header">
          <div className="lp-section-tag">FUNCIONALIDADES</div>
          <div className="lp-section-title">TUDO QUE VOCÊ PRECISA<br />NUM SÓ LUGAR</div>
        </div>
        <div className="lp-features-grid">

          <div className="lp-feature-card" data-num="01">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="22" y="4"  width="16" height="4" fill="#FFD200"/>
                <rect x="18" y="8"  width="24" height="4" fill="#FFD200"/>
                <rect x="14" y="12" width="32" height="4" fill="#FFD200"/>
                <rect x="12" y="16" width="36" height="4" fill="#FFD200"/>
                <rect x="12" y="20" width="36" height="4" fill="#FFD200"/>
                <rect x="14" y="24" width="32" height="4" fill="#FFD200"/>
                <rect x="18" y="28" width="24" height="4" fill="#FFD200"/>
                <rect x="22" y="32" width="16" height="4" fill="#FFD200"/>
                <rect x="26" y="36" width="8"  height="4" fill="#FFD200"/>
                <rect x="28" y="40" width="4"  height="8" fill="#FFD200"/>
                <rect x="24" y="16" width="12" height="12" fill="#0a0900"/>
              </svg>
            </div>
            <h3>MAPA<br />INTERATIVO</h3>
            <p>Visualize toda a cena musical da sua cidade em tempo real. Filtre por gênero, disponibilidade e tipo de agente.</p>
          </div>

          <div className="lp-feature-card" data-num="02">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="4"  y="20" width="16" height="16" fill="#FF6B00"/>
                <rect x="8"  y="24" width="8"  height="8"  fill="#0a0900"/>
                <rect x="40" y="20" width="16" height="16" fill="#00E5FF"/>
                <rect x="44" y="24" width="8"  height="8"  fill="#0a0900"/>
                <rect x="20" y="27" width="4"  height="4"  fill="#FFD200"/>
                <rect x="26" y="27" width="4"  height="4"  fill="#FFD200"/>
                <rect x="32" y="27" width="4"  height="4"  fill="#FFD200"/>
              </svg>
            </div>
            <h3>CONEXÕES<br />DIRETAS</h3>
            <p>Envie propostas e negocie diretamente com bandas, produtores e venues sem intermediários.</p>
          </div>

          <div className="lp-feature-card" data-num="03">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="8"  y="8"  width="44" height="4"  fill="#FFD200"/>
                <rect x="8"  y="12" width="4"  height="36" fill="#FFD200"/>
                <rect x="48" y="12" width="4"  height="36" fill="#FFD200"/>
                <rect x="8"  y="48" width="44" height="4"  fill="#FFD200"/>
                <rect x="12" y="16" width="36" height="4"  fill="#FFD200"/>
                <rect x="14" y="24" width="6"  height="6"  fill="#FF6B00"/>
                <rect x="24" y="24" width="6"  height="6"  fill="#00E5FF"/>
                <rect x="34" y="24" width="6"  height="6"  fill="#FFD200"/>
                <rect x="14" y="34" width="6"  height="6"  fill="#FFD200"/>
                <rect x="24" y="34" width="6"  height="6"  fill="#FF6B00"/>
              </svg>
            </div>
            <h3>AGENDA<br />DE SHOWS</h3>
            <p>Gerencie sua agenda de apresentações, ensaios e gravações. Nunca mais perca uma oportunidade.</p>
          </div>

          <div className="lp-feature-card" data-num="04">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="20" y="4"  width="20" height="4"  fill="#FFD200"/>
                <rect x="16" y="8"  width="28" height="4"  fill="#FFD200"/>
                <rect x="12" y="12" width="36" height="20" fill="#1a1800"/>
                <rect x="12" y="12" width="4"  height="20" fill="#FFD200"/>
                <rect x="44" y="12" width="4"  height="20" fill="#FFD200"/>
                <rect x="12" y="32" width="36" height="4"  fill="#FFD200"/>
                <rect x="26" y="16" width="8"  height="8"  fill="#FFD200"/>
                <rect x="22" y="26" width="16" height="6"  fill="#FFD200"/>
                <rect x="16" y="38" width="6"  height="6"  fill="#FF6B00"/>
                <rect x="27" y="38" width="6"  height="6"  fill="#FF6B00"/>
                <rect x="38" y="38" width="6"  height="6"  fill="#FF6B00"/>
                <rect x="8"  y="44" width="44" height="4"  fill="#FFD200"/>
                <rect x="8"  y="48" width="44" height="4"  fill="#FFD200"/>
              </svg>
            </div>
            <h3>PERFIL<br />PROFISSIONAL</h3>
            <p>Seu portfólio, demos, rider técnico e avaliações em um só perfil. Mostre quem você é pra cena.</p>
          </div>

          <div className="lp-feature-card" data-num="05">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="8"  y="8"  width="40" height="4"  fill="#00E5FF"/>
                <rect x="4"  y="12" width="4"  height="24" fill="#00E5FF"/>
                <rect x="48" y="12" width="4"  height="24" fill="#00E5FF"/>
                <rect x="8"  y="36" width="28" height="4"  fill="#00E5FF"/>
                <rect x="12" y="40" width="4"  height="4"  fill="#00E5FF"/>
                <rect x="16" y="44" width="4"  height="4"  fill="#00E5FF"/>
                <rect x="12" y="18" width="28" height="4"  fill="#00E5FF"/>
                <rect x="12" y="26" width="20" height="4"  fill="#00E5FF"/>
              </svg>
            </div>
            <h3>CHAT<br />INTEGRADO</h3>
            <p>Converse em tempo real com outros agentes da cena. Combine detalhes, compartilhe arquivos.</p>
          </div>

          <div className="lp-feature-card" data-num="06">
            <div className="lp-feature-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="8"  y="36" width="8" height="16" fill="#FFD200"/>
                <rect x="20" y="20" width="8" height="32" fill="#FFD200"/>
                <rect x="32" y="28" width="8" height="24" fill="#FFD200"/>
                <rect x="44" y="12" width="8" height="40" fill="#FFD200"/>
                <rect x="8"  y="32" width="8" height="4"  fill="#FF6B00"/>
                <rect x="20" y="16" width="8" height="4"  fill="#FF6B00"/>
                <rect x="32" y="24" width="8" height="4"  fill="#FF6B00"/>
                <rect x="44" y="8"  width="8" height="4"  fill="#FF6B00"/>
              </svg>
            </div>
            <h3>DEMO<br />PLAYER</h3>
            <p>Ouça demos diretamente no perfil das bandas e músicos. Descubra novos talentos da cena local.</p>
          </div>

        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lp-como" id="como">
        <div style={{ textAlign: 'center' }}>
          <div className="lp-section-tag">COMO FUNCIONA</div>
          <div className="lp-section-title">SIMPLES ASSIM</div>
        </div>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <h4>CRIE SEU<br />PERFIL</h4>
            <p>Cadastre sua banda, produtor ou casa de show em minutos</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <h4>APAREÇA<br />NO MAPA</h4>
            <p>Seu pin aparece no mapa da cena automaticamente com sua localização</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <h4>CONECTE<br />E NEGOCIE</h4>
            <p>Receba propostas ou envie as suas. Chat direto, sem complicação</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">04</div>
            <h4>TOCA<br />O SHOW</h4>
            <p>Confirme o booking, defina os detalhes e manda ver no palco</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">GARAGEDOM</div>
        <div className="lp-footer-copy">
          © 2026 GARAGEDOM<br />
          feito pra cena, pela cena
        </div>
      </footer>
    </div>
  );
}
