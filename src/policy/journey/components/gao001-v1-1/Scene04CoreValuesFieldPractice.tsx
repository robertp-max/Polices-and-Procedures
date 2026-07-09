import { useRef } from 'react';
import CoreValuesInteractiveViewer from '../CoreValuesInteractiveViewer';
import type { SceneProps } from './gao001-shared';

export default function Scene04CoreValuesFieldPractice(props: SceneProps) {
  const completionRef = useRef(false);

  return (
    <div className="h-[680px] bg-[#FDF8F3] p-4 md:p-6">
      <CoreValuesInteractiveViewer
        onComplete={() => {
          if (completionRef.current) return;
          completionRef.current = true;
          props.onProgressChange?.({
            resolved: {
              coreValuesFieldPractice: {
                resolved: true,
                attempts: 1,
              },
            },
          } as any);
          props.onComplete();
        }}
      />
    </div>
  );
}
