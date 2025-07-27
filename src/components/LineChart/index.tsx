import { ComponentPropsWithoutRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';

import styles from './LineChart.module.css';
import { Tooltip } from '../Tooltip';

type Day = {
  date: Date;
  value: number | null;
};

export type LineChartData = {
  date: Date;
  items: { id: string; label: string; value: number }[];
}[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: LineChartData;
  height?: number;
  period: [Date, Date];
  width?: number;
};

export function LineChart({ data, height = 240, period, width = 920, ...props }: Props) {
  const [focusedTime, setFocusedTime] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const margin = { bottom: 24, left: 40 };

  const x = useMemo(() => {
    return d3.scaleTime().domain(period).range([margin.left, width]);
  }, [margin.left, period, width]);

  const xBand = useMemo(() => {
    const domain = d3.timeDay.range(period[0], period[1]).map((date) => date.getTime().toString());

    return d3.scaleBand().domain(domain).range([margin.left, width]);
  }, [margin.left, period, width]);

  const y = useMemo(() => {
    const max = d3.max(data, (datum) => d3.max(datum.items, (item) => item.value) ?? 0) ?? 0;

    return d3
      .scaleLinear()
      .domain([max, 0])
      .range([0, height - margin.bottom])
      .nice();
  }, [data, height, margin.bottom]);

  const dataByLine = useMemo(() => {
    // 1個目のデータのitemsを元にlineの配列を作る
    const lines = data.at(0)?.items.map((item) => ({ id: item.id, label: item.label })) ?? [];

    return lines.map((line) => {
      return {
        id: line.id,
        label: line.label,
        dates: data.map((datum) => {
          const item = datum.items.find((item) => item.id === line.id);
          return { date: datum.date, value: item?.value ?? null };
        }),
      };
    });
  }, [data]);

  const line = useMemo(() => {
    return d3
      .line<Day>()
      .defined((datum) => datum.value !== null)
      .x((datum) => x(datum.date))
      .y((datum) => y(datum.value ?? 0));
  }, [x, y]);

  const lineData = useMemo(() => {
    return dataByLine.map((datum) => {
      return { id: datum.id, label: datum.label, d: line(datum.dates) ?? '' };
    });
  }, [dataByLine, line]);

  const markerData = useMemo(() => {
    return data.map((datum) => {
      return {
        id: datum.date.getTime(),
        items: datum.items.map((item) => {
          return { ...item, x: x(datum.date), y: y(item.value) };
        }),
        line: { x: x(datum.date), y: 0, height: height - margin.bottom },
      };
    });
  }, [data, height, margin.bottom, x, y]);

  const axisXData = useMemo(() => {
    return x.ticks(5).map((datum) => {
      const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit' };

      return { label: datum.toLocaleString('ja-JP', options), x: x(datum) };
    });
  }, [x]);

  const axisYData = useMemo(() => {
    return y.ticks(5).map((datum) => ({ label: datum, y: y(datum) ?? 0 }));
  }, [y]);

  const tooltipData = useMemo(() => {
    if (!focusedTime) return;

    const selectedData = data.find((datum) => datum.date.getTime() === focusedTime);

    if (!selectedData) return;

    return {
      date: selectedData.date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      items: selectedData.items.map((datum) => {
        return { ...datum, value: datum.value.toLocaleString('ja-JP') };
      }),
    };
  }, [data, focusedTime]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      const date = x.invert(d3.pointer(event)[0] + xBand.bandwidth() / 2);
      date.setHours(0, 0, 0, 0);

      setFocusedTime(date.getTime());
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    },
    [x, xBand],
  );

  const handleMouseLeave = useCallback(() => {
    setFocusedTime(null);
  }, []);

  return (
    <div className={styles.lineChart} {...props}>
      <svg width={width} height={height}>
        <g>
          <line
            x1={margin.left}
            x2={width}
            y1={height - margin.bottom}
            y2={height - margin.bottom}
            className={styles.frame}
          />
          <line
            x1={margin.left}
            x2={margin.left}
            y1={0}
            y2={height - margin.bottom}
            className={styles.frame}
          />
        </g>
        <g className={styles.axisX}>
          {axisXData.map((datum) => (
            <g key={datum.label} transform={`translate(${datum.x},${height})`}>
              <text className={styles.label}>{datum.label}</text>
            </g>
          ))}
        </g>
        <g className={styles.axisY} transform={`translate(${margin.left},0)`}>
          {axisYData.map((datum) => (
            <g key={datum.label} transform={`translate(0,${datum.y})`}>
              <text className={styles.label}>{datum.label}</text>
            </g>
          ))}
        </g>
        <g>
          {lineData.map((datum) => (
            <path key={datum.id} d={datum.d} data-id={datum.id} className={styles.line} />
          ))}
        </g>
        <g>
          {markerData.map((datum) => (
            <g key={datum.id} data-active={datum.id === focusedTime} className={styles.markerGroup}>
              <line
                x1={datum.line.x}
                x2={datum.line.x}
                y1={datum.line.y}
                y2={datum.line.height}
                className={styles.pointerLine}
              />
              {datum.items.map((item) => (
                <circle
                  key={item.id}
                  cx={item.x}
                  cy={item.y}
                  r={3}
                  data-id={item.id}
                  className={styles.marker}
                />
              ))}
            </g>
          ))}
        </g>
        <g>
          <rect
            x={margin.left}
            y={0}
            width={width - margin.left}
            height={height - margin.bottom}
            className={styles.pointer}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </g>
      </svg>
      {tooltipData && (
        <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
          <p className={styles.tooltipDate}>{tooltipData.date}</p>
          <ul className={styles.tooltipList}>
            {tooltipData.items?.map((datum) => (
              <li key={datum.id} data-id={datum.id} className={styles.tooltipItem}>
                {datum.label}: {datum.value}
              </li>
            ))}
          </ul>
        </Tooltip>
      )}
    </div>
  );
}
