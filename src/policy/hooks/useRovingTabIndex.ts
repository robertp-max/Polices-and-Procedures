import React, { useState, useRef, useCallback } from 'react';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseRovingTabIndexOptions {
  itemCount: number;
  initialIndex?: number;
  orientation?: RovingOrientation;
  homeEnd?: boolean;
  loop?: boolean;
  onFocusChange?: (newIndex: number) => void;
  isItemDisabled?: (index: number) => boolean;
}

export interface UseRovingTabIndexResult {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  getItemProps: (index: number) => {
    tabIndex: 0 | -1;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (ev: React.KeyboardEvent<HTMLElement>) => void;
    onFocus: () => void;
  };
  getContainerProps: () => {
    role?: string;
  };
}

export function useRovingTabIndex(
  options: UseRovingTabIndexOptions,
): UseRovingTabIndexResult {
  const {
    itemCount,
    initialIndex = 0,
    orientation = 'vertical',
    homeEnd = true,
    loop = true,
    onFocusChange,
    isItemDisabled,
  } = options;

  const clampedInitial = Math.max(0, Math.min(initialIndex, Math.max(0, itemCount - 1)));
  const [focusedIndex, setFocusedIndexState] = useState(clampedInitial);

  const refsRef = useRef<Array<HTMLElement | null>>([]);

  const setFocusedIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, Math.max(0, itemCount - 1)));
      setFocusedIndexState(clamped);
      const el = refsRef.current[clamped];
      if (el) {
        el.focus();
      }
      onFocusChange?.(clamped);
    },
    [itemCount, onFocusChange],
  );

  const findValidIndex = useCallback(
    (startFrom: number, dir: 1 | -1): number => {
      if (itemCount <= 0) return 0;
      let idx = startFrom;
      const visited = new Set<number>();
      let steps = 0;
      const maxSteps = itemCount + 1;

      while (steps < maxSteps) {
        if (loop) {
          idx = ((idx % itemCount) + itemCount) % itemCount;
        } else if (idx < 0 || idx >= itemCount) {
          return focusedIndex;
        }

        if (visited.has(idx)) break;
        visited.add(idx);

        if (!isItemDisabled || !isItemDisabled(idx)) {
          return idx;
        }

        idx += dir;
        steps++;
      }

      return focusedIndex;
    },
    [itemCount, loop, isItemDisabled, focusedIndex],
  );

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLElement>) => {
      const current = focusedIndex;
      let next = current;
      let shouldPrevent = false;

      const vertical = orientation === 'vertical' || orientation === 'both';
      const horizontal = orientation === 'horizontal' || orientation === 'both';

      if (vertical && ev.key === 'ArrowDown') {
        next = findValidIndex(current + 1, 1);
        shouldPrevent = true;
      } else if (vertical && ev.key === 'ArrowUp') {
        next = findValidIndex(current - 1, -1);
        shouldPrevent = true;
      } else if (horizontal && ev.key === 'ArrowRight') {
        next = findValidIndex(current + 1, 1);
        shouldPrevent = true;
      } else if (horizontal && ev.key === 'ArrowLeft') {
        next = findValidIndex(current - 1, -1);
        shouldPrevent = true;
      } else if (homeEnd && ev.key === 'Home') {
        next = findValidIndex(0, 1);
        shouldPrevent = true;
      } else if (homeEnd && ev.key === 'End') {
        next = findValidIndex(itemCount - 1, -1);
        shouldPrevent = true;
      }

      if (shouldPrevent) {
        ev.preventDefault();
      }

      if (next !== current && next >= 0 && next < itemCount) {
        setFocusedIndex(next);
      }
    },
    [focusedIndex, orientation, homeEnd, itemCount, findValidIndex, setFocusedIndex],
  );

  const handleFocus = useCallback(
    (index: number) => {
      if (index !== focusedIndex) {
        setFocusedIndexState(index);
        onFocusChange?.(index);
      }
    },
    [focusedIndex, onFocusChange],
  );

  const getItemProps = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, Math.max(0, itemCount - 1)));
      return {
        tabIndex: (safeIndex === focusedIndex ? 0 : -1) as 0 | -1,
        ref: (el: HTMLElement | null) => {
          refsRef.current[index] = el;
        },
        onKeyDown: handleKeyDown,
        onFocus: () => handleFocus(safeIndex),
      };
    },
    [focusedIndex, itemCount, handleKeyDown, handleFocus],
  );

  const getContainerProps = useCallback(() => ({}), []);

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
    getContainerProps,
  };
}
