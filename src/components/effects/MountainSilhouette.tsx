export function MountainSilhouette() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0" aria-hidden>
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full block"
        style={{ height: '80px' }}
      >
        {/* Far snowy mountain range */}
        <path
          d="M0,100 L0,72 L28,44 L55,65 L88,32 L118,55 L148,25 L178,50 L208,20 L238,46 L268,30 L298,54 L328,22 L358,50 L388,36 L400,44 L400,100 Z"
          fill="#0c0808"
        />
        {/* Near ridge */}
        <path
          d="M0,100 L0,85 L40,82 L80,87 L120,78 L160,84 L200,74 L240,82 L280,72 L320,80 L360,74 L400,80 L400,100 Z"
          fill="#090606"
        />
        {/* Pine tree silhouettes */}
        <path
          d="M-2,100 L5,80 L12,100 Z M14,100 L20,82 L26,100 Z M27,100 L35,78 L43,100 Z M45,100 L50,84 L55,100 Z M58,100 L65,79 L72,100 Z M74,100 L80,81 L86,100 Z M87,100 L95,77 L103,100 Z M103,100 L110,82 L117,100 Z M121,100 L126,80 L131,100 Z M134,100 L140,83 L146,100 Z M147,100 L155,78 L163,100 Z M163,100 L170,80 L177,100 Z M180,100 L186,81 L192,100 Z M195,100 L200,84 L205,100 Z M207,100 L215,76 L223,100 Z M223,100 L230,79 L237,100 Z M240,100 L246,82 L252,100 Z M252,100 L260,78 L268,100 Z M270,100 L275,83 L280,100 Z M283,100 L290,80 L297,100 Z M300,100 L306,81 L312,100 Z M312,100 L320,77 L328,100 Z M327,100 L334,82 L341,100 Z M345,100 L350,79 L355,100 Z M359,100 L365,83 L371,100 Z M372,100 L380,78 L388,100 Z M389,100 L395,81 L401,100 Z"
          fill="#060404"
        />
      </svg>
    </div>
  )
}
