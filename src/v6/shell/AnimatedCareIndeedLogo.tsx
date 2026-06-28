type AnimatedCareIndeedLogoProps = {
  active?: boolean;
  className?: string;
  imageClassName?: string;
};

export function AnimatedCareIndeedLogo({ className = '', imageClassName = '' }: AnimatedCareIndeedLogoProps) {
  return (
    <div className={`animated-careindeed-logo relative inline-grid place-items-center overflow-visible ${className}`}>
      <img
        src="/apple-icon.png"
        alt="Care Indeed"
        className={`relative z-10 block h-full w-full object-contain ${imageClassName}`}
        draggable={false}
      />
    </div>
  );
}
