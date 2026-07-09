function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function StaticCardWatermark({ className }: { className?: string } = {}) {
  return (
    <div aria-hidden="true" className={classNames('ci-static-header-watermark', className)} />
  );
}

export default StaticCardWatermark;
