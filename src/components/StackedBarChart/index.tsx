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
  const margin = { bottom: 36, left: 40 };

  const dates = useMemo(() => {
    return d3.timeDay.range(period[0], d3.timeDay.offset(period[1], 1));
  }, [period]);

  const x = useMemo(() => {
    const domain = dates.map((date) => date.getTime().toString());

    return d3.scaleBand().domain(domain).range([margin.left, width]).padding(0.5);
  }, [margin.left, width, dates]);

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
          return {
            id: categories[i],
            x: x(datum.date.getTime().toString()),
            y: y(d[1]),
            width: x.bandwidth(),
            height: y(d[0]) - y(d[1]),
          };
        }),
      };
    });
  }, [categories, data, series, x, y]);

  const axisXData = useMemo(() => {
    return dates.map((date, i) => {
      const label = { date: `${date.getDate()}`, yearMonth: '' };

      // 最初の要素 or 日付が1日の場合は年月も表示する
      if (i === 0 || date.getDate() === 1) {
        label.yearMonth = `${date.getFullYear()}/${date.getMonth() + 1}`;
      }

      return {
        id: date.getTime(),
        label,
        x: (x(date.getTime().toString()) ?? 0) + x.bandwidth() / 2,
      };
    });
  }, [dates, x]);

  const axisYData = useMemo(() => {
    return y.ticks(5).map((datum) => ({ label: datum, y: y(datum) ?? 0 }));
  }, [y]);

  const pointerData = useMemo(() => {
    return data.map((datum) => {
      return {
        id: datum.date.getTime(),
        x: (x(datum.date.getTime().toString()) ?? 0) - x.bandwidth() / 2,
        y: 0,
        width: x.step(),
        height: height - margin.bottom,
      };
    });
  }, [data, height, margin.bottom, x]);

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
            <g key={datum.id} transform={`translate(${datum.x},${height - margin.bottom})`}>
              <text className={styles.label}>{datum.label.date}</text>
              {datum.label.yearMonth && (
                <text className={styles.label}>{datum.label.yearMonth}</text>
              )}
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
