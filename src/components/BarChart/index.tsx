import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './BarChart.module.css';

export type BarChartData = {
  id: string;
  label: string;
  value: number;
}[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: BarChartData;
  height?: number;
  width?: number;
};

export function BarChart({ data, height = 240, width = 640, ...props }: Props) {
  const margin = { top: 16, left: 64 };

  const sortedData = useMemo(() => {
    return data.toSorted((a, b) => (a.value > b.value ? -1 : 1));
  }, [data]);

  const x = useMemo(() => {
    const max = d3.max(sortedData, (d) => d.value) ?? 0;
    return d3.scaleLinear().domain([0, max]).range([margin.left, width]).nice();
  }, [margin.left, sortedData, width]);

  const y = useMemo(() => {
    return d3
      .scaleBand()
      .domain(d3.sort(sortedData, (d) => -d.value).map((d) => d.label))
      .rangeRound([margin.top, height])
      .padding(0.25);
  }, [height, margin.top, sortedData]);

  const barData = useMemo(() => {
    return sortedData.map((d) => {
      return { ...d, x: x(0), y: y(d.label), width: x(d.value) - x(0), height: y.bandwidth() };
    });
  }, [sortedData, x, y]);

  const axisXData = useMemo(() => {
    const domain = x.domain();
    return d3.ticks(domain[0], domain[1], 5).map((d) => ({ label: d, x: x(d) }));
  }, [x]);

  const axisYData = useMemo(() => {
    return y.domain().map((d) => ({ label: d, y: (y(d) ?? 0) + y.bandwidth() / 2 }));
  }, [y]);

  return (
    <div className={styles.barChart} {...props}>
      <svg width={width} height={height}>
        <g className={styles.axisX}>
          {axisXData.map((data) => (
            <g key={data.label} transform={`translate(${data.x},0)`}>
              <line y1={margin.top} y2={height} />
              <text>{data.label}</text>
            </g>
          ))}
        </g>
        <g className={styles.axisY} transform={`translate(${margin.left},0)`}>
          {axisYData.map((data) => (
            <g key={data.label} transform={`translate(0,${data.y})`}>
              <text>{data.label}</text>
            </g>
          ))}
        </g>
        <g className={styles.bars}>
          {barData.map((data) => (
            <rect key={data.id} x={data.x} y={data.y} width={data.width} height={data.height} />
          ))}
        </g>
      </svg>
    </div>
  );
}
