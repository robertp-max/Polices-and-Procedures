import DotGrid from './DotGrid';

export function GlobalDotBackground() {
  return (
    <div className="ci-global-dot-background" aria-hidden="true">
      <DotGrid
        dotSize={2}
        gap={5}
        baseColor="#00151a"
        activeColor="#002e40"
        proximity={0}
        speedTrigger={Number.MAX_SAFE_INTEGER}
        shockRadius={0}
        shockStrength={5}
        resistance={100}
        returnDuration={3.7}
      />
    </div>
  );
}

export default GlobalDotBackground;
