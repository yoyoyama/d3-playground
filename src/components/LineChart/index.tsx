import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './LineChart.module.css';

type Day = {
  date: Date;
  value: number;
};

export type LineChartData = {
  id: string;
  label: string;
  dates: Day[];
}[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: LineChartData;
  height?: number;
  period: [Date, Date];
  width?: number;
};

export function LineChart({ data, height = 240, period, width = 920, ...props }: Props) {
  const margin = { bottom: 24, left: 32 };

  const x = useMemo(() => {
    return d3.scaleTime().domain(period).range([margin.left, width]);
  }, [margin.left, period, width]);

  const y = useMemo(() => {
    const max = d3.max(data, (datum) => d3.max(datum.dates, (day) => day.value) ?? 0) ?? 0;

    return d3
      .scaleLinear()
      .domain([max, 0])
      .range([0, height - margin.bottom])
      .nice();
  }, [data, height, margin.bottom]);

  const line = useMemo(() => {
    return d3
      .line<Day>()
      .x((datum) => x(datum.date))
      .y((datum) => y(datum.value));
  }, [x, y]);

  const lineData = useMemo(() => {
    return data.map((datum) => {
      return { id: datum.id, label: datum.label, d: line(datum.dates) ?? '' };
    });
  }, [data, line]);

  const markerData = useMemo(() => {
    return data.map((datum) => {
      return {
        id: datum.id,
        dates: datum.dates.map((day) => {
          return {
            id: `${day.date.getFullYear()}${day.date.getMonth()}${day.date.getDate()}`,
            x: x(day.date),
            y: y(day.value),
          };
        }),
      };
    });
  }, [data, x, y]);

  const axisXData = useMemo(() => {
    return x.ticks(5).map((datum, i, array) => {
      const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit' };

      // iが0 or ひとつ前のdと年が異なる場合はラベルに年も表示する
      if (i === 0 || datum.getFullYear() !== array[i - 1].getFullYear()) {
        options.year = 'numeric';
      }

      const label = datum.toLocaleString('ja-JP', options);

      return { label, x: x(datum) };
    });
  }, [x]);

  const axisYData = useMemo(() => {
    return y.ticks(5).map((datum) => ({ label: datum, y: y(datum) ?? 0 }));
  }, [y]);

  return (
    <div className={styles.barChart} {...props}>
      <svg width={width} height={height}>
        <g className={styles.axisX}>
          {axisXData.map((datum) => (
            <g key={datum.label} transform={`translate(${datum.x},${height})`}>
              <text className={styles.label}>{datum.label}</text>
            </g>
          ))}
          <line
            x1={margin.left}
            x2={width}
            y1={height - margin.bottom}
            y2={height - margin.bottom}
            className={styles.frame}
          />
        </g>
        <g className={styles.axisY} transform={`translate(${margin.left},0)`}>
          {axisYData.map((datum) => (
            <g key={datum.label} transform={`translate(0,${datum.y})`}>
              <text className={styles.label}>{datum.label}</text>
            </g>
          ))}
          <line x1={0} x2={0} y1={0} y2={height - margin.bottom} className={styles.frame} />
        </g>
        <g>
          {lineData.map((datum) => (
            <path key={datum.id} d={datum.d} data-id={datum.id} className={styles.line} />
          ))}
        </g>
        <g>
          {markerData.map((datum) => (
            <g key={datum.id}>
              {datum.dates.map((day) => (
                <circle
                  key={day.id}
                  cx={day.x}
                  cy={day.y}
                  r={3}
                  data-id={datum.id}
                  data-date={day.id}
                  className={styles.marker}
                />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
