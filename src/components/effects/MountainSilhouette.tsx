export function MountainSilhouette() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0" aria-hidden>
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full block"
        style={{ height: '160px' }}
      >
        <defs>
          <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050505" stopOpacity="0" />
            <stop offset="100%" stopColor="#050505" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8d8e8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c8d8e8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Hintergrund-Gebirge */}
        <path
          d="M0,200 L0,140 L60,90 L100,115 L150,65 L200,100 L250,50 L300,88 L350,40 L400,75 L450,35 L500,70 L550,45 L600,80 L650,30 L700,70 L750,55 L800,80 L800,200 Z"
          fill="#0a0c10"
          opacity="0.8"
        />

        {/* Schnee-Highlights auf Hintergrundgipfeln */}
        <path
          d="M150,65 L160,80 L140,80 Z
             M250,50 L262,68 L238,68 Z
             M350,40 L363,60 L337,60 Z
             M450,35 L464,56 L436,56 Z
             M550,45 L562,63 L538,63 Z
             M650,30 L665,52 L635,52 Z"
          fill="url(#snowGrad)"
          opacity="0.6"
        />

        {/* Mittelgrund-Berge */}
        <path
          d="M0,200 L0,155 L50,130 L80,145 L120,100 L155,125 L195,80 L225,108 L270,58 L310,90 L345,68 L375,88 L410,48 L445,78 L480,55 L510,80 L545,38 L580,72 L615,58 L650,85 L685,42 L720,75 L760,60 L800,85 L800,200 Z"
          fill="#0d0f12"
        />

        {/* Schnee-Highlights Mittelgrund */}
        <path
          d="M270,58 L285,80 L255,80 Z
             M410,48 L427,73 L393,73 Z
             M545,38 L563,65 L527,65 Z
             M685,42 L702,68 L668,68 Z"
          fill="#c8d8e8"
          opacity="0.7"
        />

        {/* Scharfe Schnee-Kanten */}
        <path
          d="M270,58 L280,72 L270,70 L260,72 Z
             M410,48 L421,64 L410,62 L399,64 Z
             M545,38 L557,56 L545,54 L533,56 Z
             M685,42 L697,60 L685,58 L673,60 Z"
          fill="#e8f0f8"
          opacity="0.5"
        />

        {/* Vordergrund-Kamm */}
        <path
          d="M0,200 L0,175 L30,170 L60,178 L90,165 L120,172 L150,160 L180,170 L210,158 L240,168 L270,155 L300,165 L330,158 L360,170 L390,162 L420,172 L450,160 L480,170 L510,162 L540,172 L570,165 L600,175 L630,168 L660,177 L690,165 L720,174 L750,168 L780,175 L800,170 L800,200 Z"
          fill="#080a0d"
        />

        {/* Tannen-Silhouetten */}
        <path
          d="M0,200 L8,168 L16,200 Z M18,200 L26,162 L34,200 Z M36,200 L46,156 L56,200 Z
             M58,200 L66,165 L74,200 Z M76,200 L85,158 L94,200 Z M96,200 L104,163 L112,200 Z
             M114,200 L124,154 L134,200 Z M136,200 L144,160 L152,200 Z M154,200 L162,157 L170,200 Z
             M172,200 L182,151 L192,200 Z M194,200 L202,159 L210,200 Z M212,200 L220,155 L228,200 Z
             M230,200 L240,149 L250,200 Z M252,200 L260,156 L268,200 Z M270,200 L280,153 L290,200 Z
             M292,200 L300,160 L308,200 Z M310,200 L320,154 L330,200 Z M332,200 L340,158 L348,200 Z
             M350,200 L360,152 L370,200 Z M372,200 L380,157 L388,200 Z M390,200 L400,153 L410,200 Z
             M412,200 L420,158 L428,200 Z M430,200 L440,151 L450,200 Z M452,200 L460,156 L468,200 Z
             M470,200 L480,153 L490,200 Z M492,200 L500,159 L508,200 Z M510,200 L520,154 L530,200 Z
             M532,200 L540,157 L548,200 Z M550,200 L560,151 L570,200 Z M572,200 L580,156 L588,200 Z
             M590,200 L600,153 L610,200 Z M612,200 L620,158 L628,200 Z M630,200 L640,154 L650,200 Z
             M652,200 L660,157 L668,200 Z M670,200 L680,152 L690,200 Z M692,200 L700,156 L708,200 Z
             M710,200 L720,153 L730,200 Z M732,200 L740,158 L748,200 Z M750,200 L760,154 L770,200 Z
             M772,200 L782,157 L792,200 Z M794,200 L800,160 L806,200 Z"
          fill="#060809"
        />

        {/* Nebel-Overlay */}
        <rect x="0" y="130" width="800" height="70" fill="url(#fogGrad)" />
      </svg>
    </div>
  )
}
