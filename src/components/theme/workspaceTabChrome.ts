export const workspaceTabNavClass =
  'relative z-20 flex max-w-full items-stretch overflow-x-auto -mb-px font-montserrat';

const workspaceTabChrome =
  'inline-flex h-12 min-h-12 shrink-0 rounded-t-lg border-l border-r border-t font-montserrat text-center text-[13.5px] font-bold uppercase leading-none tracking-widest outline-none';

export const workspaceTabClass = `${workspaceTabChrome} min-w-[156px] items-center justify-center px-5 sm:px-8`;
export const workspaceCompactTabClass = `${workspaceTabChrome} min-w-[112px] items-center justify-center px-4 sm:px-6`;
export const workspaceStackedTabClass = `${workspaceTabChrome} min-w-[112px] flex-col items-center justify-center gap-1 px-4 sm:px-6`;

export const workspaceTabActiveClass =
  'border-[#E5E4E3] bg-[#E5F4EE] text-[#052D28] shadow-none';

export const workspaceTabInactiveClass =
  'border-transparent bg-[#FAFAF7] text-[#315B53] hover:border-[#E5E4E3] hover:bg-white hover:text-[#052D28]';
