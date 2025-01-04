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

  const pathData = useMemo(() => {
    return data.map((path) => {
      const line = d3
        .line<Day>()
        .x((datum) => x(datum.date))
        .y((datum) => y(datum.value));

      return { ...path, d: line(path.dates) ?? '' };
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
          {axisXData.map((data) => (
            <g key={data.label} transform={`translate(${data.x},${height})`}>
              <text className={styles.label}>{data.label}</text>
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
          {axisYData.map((data) => (
            <g key={data.label} transform={`translate(0,${data.y})`}>
              <text className={styles.label}>{data.label}</text>
            </g>
          ))}
          <line x1={0} x2={0} y1={0} y2={height - margin.bottom} className={styles.frame} />
        </g>
        <g>
          {pathData.map((data) => (
            <path key={data.id} d={data.d} data-id={data.id} className={styles.line} />
          ))}
        </g>
      </svg>
    </div>
  );
}
