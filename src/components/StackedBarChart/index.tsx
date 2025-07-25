import { ComponentPropsWithoutRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';

import styles from './StackedBarChart.module.css';
import { Tooltip } from '../Tooltip';

type Bar = {
  date: Date;
  items: { id: string; label: string; value: number }[];
  total: number;
};

export type StackedBarChartData = Bar[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: StackedBarChartData;
  height?: number;
  period: [Date, Date];
  width?: number;
};

export function StackedBarChart({ data, height = 240, period, width = 920, ...props }: Props) {
  const [focusedTime, setFocusedTime] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const margin = { bottom: 24, left: 40 };

  const xBand = useMemo(() => {
    const domain = d3.timeDay
      .range(period[0], d3.timeDay.offset(period[1], 1))
      .map((date) => String(date.getTime()));

    return d3.scaleBand().domain(domain).range([margin.left, width]).paddingInner(0.5);
  }, [margin.left, period, width]);

  const x = useMemo(() => {
    return d3
      .scaleTime()
      .domain([period[0], d3.timeDay.offset(period[1], 1)])
      .range([margin.left, width]);
  }, [margin.left, period, width]);

  const y = useMemo(() => {
    const max = d3.max(data, (datum) => datum.total) ?? 0;

    return d3
      .scaleLinear()
      .domain([max, 0])
      .range([0, height - margin.bottom])
      .nice();
  }, [data, height, margin.bottom]);

  const categories = useMemo(() => {
    return data.flatMap((datum) => datum.items.map((item) => item.id));
  }, [data]);

  const series = useMemo(() => {
    return d3
      .stack<Bar>()
      .keys(d3.union(categories))
      .order(d3.stackOrderReverse)
      .value((d, key) => d.items.find((item) => item.id === key)?.value ?? 0)(data);
  }, [categories, data]);

  const stackedData = useMemo(() => {
    return data.map((datum, dateIndex) => {
      return {
        id: datum.date.getTime(),
        items: series.map((s, i) => {
          const d = s[dateIndex];
          const width = xBand.bandwidth();
          return {
            id: categories[i],
            x: x(datum.date) + width / 2,
            y: y(d[1]),
            width,
            height: y(d[0]) - y(d[1]),
          };
        }),
      };
    });
  }, [categories, data, series, x, xBand, y]);

  const axisXData = useMemo(() => {
    return x.ticks(5).map((datum) => {
      const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit' };

      return { label: datum.toLocaleString('ja-JP', options), x: x(datum) + xBand.step() / 2 };
    });
  }, [x, xBand]);

  const axisYData = useMemo(() => {
    return y.ticks(5).map((datum) => ({ label: datum, y: y(datum) ?? 0 }));
  }, [y]);

  const pointerData = useMemo(() => {
    return data.map((datum) => {
      return {
        id: datum.date.getTime(),
        x: x(datum.date),
        y: 0,
        width: xBand.step(),
        height: height - margin.bottom,
      };
    });
  }, [data, height, margin.bottom, x, xBand]);

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

  const handleMouseEnter = useCallback((event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const id = Number(event.currentTarget.dataset.id);
    setFocusedTime(id);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setFocusedTime(null);
  }, []);

  return (
    <div className={styles.barChart} {...props}>
      <svg width={width} height={height}>
        <g>
          {pointerData.map((datum) => (
            <rect
              key={datum.id}
              x={datum.x}
              y={datum.y}
              width={datum.width}
              height={datum.height}
              data-id={datum.id}
              className={styles.pointer}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </g>
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
          {stackedData.map((datum) => (
            <g key={datum.id}>
              {datum.items.map((item, index) => (
                <rect
                  key={index}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  data-id={item.id}
                  className={styles.bar}
                />
              ))}
            </g>
          ))}
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
