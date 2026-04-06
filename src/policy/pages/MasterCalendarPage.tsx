import { useCalendarStore } from '@/policy/stores/calendarStore';
import { Calendar as CalendarIcon, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

function StatusKpiCard({ 
  title, count, icon, desc, accentColor
}: {
  title: string; count: number; icon: React.ReactNode; desc: string; accentColor: string;
}) {
  return (
    <div
      className="glass-interactive group border border-white/10 rounded-2xl p-6 relative overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-montserrat font-bold uppercase tracking-widest icon-interactive" style={{ color: accentColor }}>
          {title}
        </h3>
        <span className="icon-interactive" style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="text-6xl font-light text-white leading-none mb-3">{count}</div>
      <p className="text-xs text-white/50 font-roboto">{desc}</p>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
      <span className="text-sm font-montserrat font-bold text-white/70 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-montserrat font-light text-white">{value}</span>
    </div>
  );
}

export function MasterCalendarPage() {
  const events = useCalendarStore(state => state.tasks) || [];
  
  const totalEvents = events?.length ?? 0;
  const compliantActions = events?.filter(e => e.status === 'Completed').length ?? 0;
  const upcoming30Days = events?.filter(e => {
    const now = new Date();
    const eventDate = new Date(e.nextDate);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length ?? 0;
  const criticalDeadlines = events?.filter(e => e.status === 'Escalation').length ?? 0;

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2">
          COMPLIANCE
        </div>
        <h1 className="text-2xl font-montserrat font-bold text-white leading-none mb-2">
          CONTEXT: MASTER CALENDAR
        </h1>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusKpiCard title="TOTAL EVENTS"       count={totalEvents}      desc="All scheduled events"         icon={<CalendarIcon size={24} />}  accentColor="#00c2b4" />
        <StatusKpiCard title="UPCOMING (30 DAYS)" count={upcoming30Days}   desc="Events in next 30 days"       icon={<Clock size={24} />}         accentColor="#FBBF24" />
        <StatusKpiCard title="CRITICAL DEADLINES" count={criticalDeadlines} desc="Immediate attention"         icon={<AlertTriangle size={24} />} accentColor="#DC2626" />
        <StatusKpiCard title="COMPLIANT ACTIONS"  count={compliantActions} desc="Completed on time"            icon={<CheckCircle size={24} />}   accentColor="#10B981" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events Table */}
        <div className="lg:col-span-2 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 group">
            <CalendarIcon size={20} className="icon-interactive text-[#00c2b4]" />
            <h2 className="icon-interactive text-lg font-montserrat font-bold text-white">Upcoming Events</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">EVENT ID</th>
                  <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">TITLE</th>
                  <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">MODULE</th>
                  <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">DATE</th>
                  <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((event, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="py-4 px-4 text-white/80 font-roboto">{event.id}</td>
                    <td className="py-4 px-4 text-white font-montserrat">{event.task}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-[#00c2b4]/20 text-[#00c2b4] uppercase">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/80 font-roboto">{event.nextDate}</td>
                    <td className="py-4 px-4">
                      {event.status === 'Escalation' && (
                        <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-[#DC2626]/20 text-[#DC2626] uppercase">
                          CRITICAL
                        </span>
                      )}
                      {event.status === 'Warning' && (
                        <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-[#FBBF24]/20 text-[#FBBF24] uppercase">
                          WARNING
                        </span>
                      )}
                      {event.status === 'Completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-[#10B981]/20 text-[#10B981] uppercase">
                          COMPLIANT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40 font-roboto">
                      No upcoming events scheduled
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 group">
            <FileText size={20} className="icon-interactive text-[#00c2b4]" />
            <h2 className="icon-interactive text-lg font-montserrat font-bold text-white">Compliance Metrics</h2>
          </div>

          <div className="space-y-1">
            <MetricItem label="BOARD MTG" value={12} />
            <MetricItem label="P&P REVIEW" value={4} />
            <MetricItem label="QAPI" value={11} />
            <MetricItem label="PROG EVAL" value={1} />
            <MetricItem label="HEALTH & SAFETY" value={12} />
            <MetricItem label="INCIDENT RPT" value={12} />
            <MetricItem label="UTILIZATION" value={12} />
            <MetricItem label="INFECTION CNTL" value={12} />
            <MetricItem label="TOTAL" value={76} />
          </div>
        </div>
      </div>

      {/* Calendar Grid Preview */}
      <div className="mt-8 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 group">
            <CalendarIcon size={20} className="icon-interactive text-[#00c2b4]" />
            <h2 className="icon-interactive text-lg font-montserrat font-bold text-white">Calendar View</h2>
          </div>
          <div className="text-sm font-montserrat font-bold text-white/80">
            October 2024
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Headers */}
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-xs font-montserrat font-bold text-white/40 text-center py-2 uppercase tracking-widest">
              {day}
            </div>
          ))}
          
          {/* Calendar Days (simplified - would be dynamic in real implementation) */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2; // Start from -2 to account for offset
            const isCurrentMonth = day > 0 && day <= 31;
            const hasEvent = [10, 19, 27].includes(day);
            
            return (
              <div
                key={i}
                className={`
                  glass-interactive aspect-square rounded-lg p-2 text-sm font-montserrat relative cursor-pointer
                  ${isCurrentMonth ? 'text-white/80' : 'text-white/20'}
                  ${hasEvent ? 'border-2 border-[#00c2b4]' : 'border border-white/5'}
                `}
              >
                {isCurrentMonth && <span className="text-xs">{day}</span>}
                {hasEvent && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#00c2b4]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
