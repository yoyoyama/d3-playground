import { ComponentPropsWithoutRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';

import styles from './BarChart.module.css';
import { Tooltip } from '../Tooltip';

type Bar = {
  id: string;
  label: string;
  value: number;
};

export type BarChartData = Bar[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: BarChartData;
  height?: number;
  width?: number;
};

export function BarChart({ data, height = 240, width = 376, ...props }: Props) {
  const [tooltipData, setTooltipData] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const margin = { top: 16, left: 64, right: 16 };

  const x = useMemo(() => {
    const max = d3.max(data, (datum) => datum.value) ?? 0;
    return d3
      .scaleLinear()
      .domain([0, max])
      .range([margin.left, width - margin.right])
      .nice();
  }, [data, margin.left, margin.right, width]);

  const y = useMemo(() => {
    return d3
      .scaleBand()
      .domain(d3.sort(data, (datum) => -datum.value).map((datum) => datum.label))
      .range([margin.top, height])
      .padding(0.3);
  }, [data, height, margin.top]);

  const barData = useMemo(() => {
    return data.map((datum) => {
      return {
        ...datum,
        x: x(0),
        y: y(datum.label),
        width: x(datum.value) - x(0),
        height: y.bandwidth(),
      };
    });
  }, [data, x, y]);

  const axisXData = useMemo(() => {
    const domain = x.domain();
    return d3.ticks(domain[0], domain[1], 5).map((datum) => ({ label: datum, x: x(datum) }));
  }, [x]);

  const axisYData = useMemo(() => {
    return y.domain().map((datum) => ({ label: datum, y: (y(datum) ?? 0) + y.bandwidth() / 2 }));
  }, [y]);

  const pointerData = useMemo(() => {
    const barHeight = y.bandwidth();
    const pointerHeight = y.step();

    return data.map((datum) => {
      return {
        ...datum,
        x: x(0),
        y: (y(datum.label) ?? 0) - (pointerHeight - barHeight) / 2,
        width: width - margin.left - margin.right,
        height: pointerHeight,
      };
    });
  }, [data, margin.left, margin.right, width, x, y]);

  const handleMouseEnter = useCallback((event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const label = event.currentTarget.dataset.label;
    const value = Number(event.currentTarget.dataset.value).toLocaleString('ja-JP');
    const data = `${label}: ${value}`;
    setTooltipData(data);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipData('');
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
              data-label={datum.label}
              data-value={datum.value}
              className={styles.pointer}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </g>
        <g className={styles.axisX}>
          {axisXData.map((datum) => (
            <g key={datum.label} transform={`translate(${datum.x},0)`}>
              <line y1={margin.top} y2={height} className={styles.frame} />
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
          {barData.map((datum) => (
            <rect
              key={datum.id}
              x={datum.x}
              y={datum.y}
              width={datum.width}
              height={datum.height}
              data-id={datum.id}
              className={styles.bar}
            />
          ))}
        </g>
      </svg>
      {tooltipData && (
        <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
          <p>{tooltipData}</p>
        </Tooltip>
      )}
    </div>
  );
}
