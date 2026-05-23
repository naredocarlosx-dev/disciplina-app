export default function EpisodioUnoLogo({ dark = false, width = 220 }) {
  const primary = dark ? "#ffffff" : "#111111"
  const secondary = dark ? "#888888" : "#888888"

  return (
    <svg
      width={width}
      viewBox="0 0 340 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Episodio Uno"
    >
      {/* Símbolo — tres barras estilo E */}
      <rect x="0" y="0"  width="46" height="9" rx="2.5" fill={primary}/>
      <rect x="0" y="19" width="33" height="9" rx="2.5" fill={primary}/>
      <rect x="0" y="38" width="46" height="9" rx="2.5" fill={primary}/>

      {/* Wordmark */}
      <text
        x="62" y="39"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="34"
        fontWeight="500"
        letterSpacing="-1"
        fill={primary}
      >
        episodio
      </text>
      <text
        x="62" y="68"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="34"
        fontWeight="400"
        letterSpacing="8"
        fill={secondary}
      >
        uno
      </text>
    </svg>
  )
}
