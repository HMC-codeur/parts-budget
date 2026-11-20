"use client";

import { useI18n } from "@/components/i18n";
import { Money } from "@/components/money";

type Segment = {
  id: string;
  value: number;
};

export function RingChart({ total, segments }: { total: number; segments: Segment[] }) {
  const { t } = useI18n();
  const size = 220;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const active = segments.filter((segment) => segment.value > 0);
  const gap = active.length > 1 ? 18 : 0;
  const arcs = active.reduce<
    Array<Segment & { dash: number; offset: number; full: boolean; portion: number }>
  >((items, segment) => {
    const previous = items[items.length - 1];
    const start = previous ? previous.offset + previous.portion : 0;
    const portion = total > 0 ? (segment.value / total) * circumference : 0;
    const full = portion >= circumference - 0.5;
    const dash = full ? circumference : portion > gap + 4 ? portion - gap : Math.max(portion - 2, 0);
    return [...items, { ...segment, dash, offset: start, full, portion }];
  }, []);

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {arcs.map((arc, index) => (
          <circle
            key={arc.id}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={Math.max(0.34, 1 - index * 0.24)}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={arc.full ? `${circumference} ${circumference}` : `${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="font-heading text-[1.65rem] leading-none tracking-tight">
          <Money agorot={total} />
        </p>
        <p className="section-kicker mt-2">{t("inflows")}</p>
      </div>
    </div>
  );
}
