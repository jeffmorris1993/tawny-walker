const palettes = {
  warm: ['#C7B999', '#A89674', '#7A6A4E'],
  cool: ['#9FA8AD', '#6F7B83', '#4A555E'],
  dusk: ['#A48D74', '#7A6856', '#3D332A'],
  night: ['#3B3A36', '#26251F', '#15140F'],
  bone: ['#E5DDC9', '#CFC4A8', '#A89A78'],
  sage: ['#B0B4A2', '#888C76', '#5A5E4E'],
};

export default function Photo({ label = 'PHOTOGRAPHY', tone = 'warm', ratio, style, height }) {
  const p = palettes[tone] || palettes.warm;
  const s = {
    position: 'relative',
    width: '100%',
    height: height || (ratio ? undefined : '100%'),
    aspectRatio: ratio,
    background: `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 55%, ${p[2]} 100%)`,
    overflow: 'hidden',
    flexShrink: 0,
    ...style,
  };
  return (
    <div style={s}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px)`,
        mixBlendMode: 'overlay',
      }} />
      {label && (
        <div style={{
          position: 'absolute', left: 14, bottom: 12,
          fontFamily: '"JetBrains Mono", "Geist Mono", ui-monospace, monospace',
          fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.78)',
        }}>
          ◌ {label}
        </div>
      )}
    </div>
  );
}
