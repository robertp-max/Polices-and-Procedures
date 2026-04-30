interface AccessDeniedPageProps {
  reason: string;
}

export function AccessDeniedPage({ reason }: AccessDeniedPageProps) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#f8fafc] px-6">
      <div className="max-w-xl w-full rounded-lg border border-rose-200 bg-rose-50 p-5">
        <h1 className="text-lg font-bold text-rose-900">Access Denied</h1>
        <p className="text-sm text-rose-800 mt-2">You do not have permission to access this Admin section.</p>
        <p className="text-xs text-rose-700 mt-3">Reason: {reason}</p>
      </div>
    </div>
  );
}

export default AccessDeniedPage;
