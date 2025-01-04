import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './BarChart.module.css';

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

export function BarChart({ data, height = 240, width = 640, ...props }: Props) {
  const margin = { top: 16, left: 64 };

  const x = useMemo(() => {
    const max = d3.max(data, (datum) => datum.value) ?? 0;
    return d3.scaleLinear().domain([0, max]).range([margin.left, width]).nice();
  }, [margin.left, data, width]);

  const y = useMemo(() => {
    return d3
      .scaleBand()
      .domain(d3.sort(data, (datum) => -datum.value).map((datum) => datum.label))
      .rangeRound([margin.top, height])
      .padding(0.25);
  }, [height, margin.top, data]);

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

  return (
    <div className={styles.barChart} {...props}>
      <svg width={width} height={height}>
        <g className={styles.axisX}>
          {axisXData.map((data) => (
            <g key={data.label} transform={`translate(${data.x},0)`}>
              <line y1={margin.top} y2={height} className={styles.frame} />
              <text className={styles.label}>{data.label}</text>
            </g>
          ))}
        </g>
        <g className={styles.axisY} transform={`translate(${margin.left},0)`}>
          {axisYData.map((data) => (
            <g key={data.label} transform={`translate(0,${data.y})`}>
              <text className={styles.label}>{data.label}</text>
            </g>
          ))}
        </g>
        <g>
          {barData.map((data) => (
            <rect
              key={data.id}
              x={data.x}
              y={data.y}
              width={data.width}
              height={data.height}
              className={styles.bar}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
