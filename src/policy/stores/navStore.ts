import { create } from 'zustand';

/**
 * Centralized internal navigation stack.
 *
 * Tracks back/forward history independently of the browser's native history
 * so that the universal shell nav controls (header buttons, keyboard arrows,
 * swipe gestures) work correctly on every eligible route.
 *
 * Flow:
 *  - `push(path)`      : called by RouteTracker on every location change.
 *                        Appends the *previous* path to backStack, clears
 *                        forwardStack, updates current.  If `_skipNext` is
 *                        true (set when we fire an internal back/forward
 *                        navigation) the call is swallowed so the stacks
 *                        don't double-count our own programmatic navigation.
 *  - `initiateBack()`  : pops backStack → returns path to navigate to, and
 *                        moves current to forwardStack.
 *  - `initiateForward()`: pops forwardStack → returns path to navigate to,
 *                        and moves current to backStack.
 */
interface NavState {
  /** The last known pathname (mirrors location.pathname). */
  _current: string;
  /** Routes we can go back to (oldest first). */
  backStack: string[];
  /** Routes we can go forward to (oldest first, pop from end). */
  forwardStack: string[];
  /**
   * When true the next `push()` call is a no-op.  Set to true before every
   * programmatic back/forward navigate so the route-change side-effect in
   * CommandCenterLayout does not corrupt the stacks.
   */
  _skipNext: boolean;

  /** Track a new navigation; called by the RouteTracker effect. */
  push: (newPath: string) => void;
  /**
   * Begin a back-navigation.  Returns the target path (caller must call
   * `navigate(target)`), or `undefined` if there's nowhere to go.
   */
  initiateBack: () => string | undefined;
  /**
   * Begin a forward-navigation.  Returns the target path, or `undefined`.
   */
  initiateForward: () => string | undefined;
}

export const useNavStore = create<NavState>((set, get) => ({
  _current: typeof window !== 'undefined' ? window.location.pathname : '/',
  backStack: [],
  forwardStack: [],
  _skipNext: false,

  push(newPath) {
    const { _current, _skipNext, backStack } = get();

    if (_skipNext) {
      set({ _skipNext: false });
      return;
    }

    // Same path — nothing to record (hash/query changes don't advance stack).
    if (newPath === _current) return;

    set({
      _current: newPath,
      backStack: [...backStack, _current],
      forwardStack: [], // any new user-initiated navigation clears forward history
    });
  },

  initiateBack() {
    const { _current, backStack, forwardStack } = get();
    if (backStack.length === 0) return undefined;

    const newBack = [...backStack];
    const target = newBack.pop()!;

    set({
      _current: target,
      backStack: newBack,
      forwardStack: [...forwardStack, _current],
      _skipNext: true, // suppress the upcoming route-change push
    });
    return target;
  },

  initiateForward() {
    const { _current, backStack, forwardStack } = get();
    if (forwardStack.length === 0) return undefined;

    const newForward = [...forwardStack];
    const target = newForward.pop()!;

    set({
      _current: target,
      backStack: [...backStack, _current],
      forwardStack: newForward,
      _skipNext: true,
    });
    return target;
  },
}));
