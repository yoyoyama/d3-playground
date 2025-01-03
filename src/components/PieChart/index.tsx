import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './PieChart.module.css';

export type Data = {
  name: string;
  value: number;
}[];

type Props = ComponentPropsWithoutRef<'svg'> & {
  data: Data;
  size?: number;
};

export function PieChart({ data, size = 240, ...props }: Props) {
  const sortedData = useMemo(() => {
    return data.toSorted((a, b) => (a.value > b.value ? -1 : 1));
  }, [data]);

  const pathData = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = 0;
    const color = d3.scaleOrdinal(d3.schemeObservable10);
    const arc = d3.arc();
    const pie = d3.pie().sort(null);
    const arcs = pie(sortedData.map((d) => d.value));

    return sortedData.map((data, i) => {
      const d = arc({ ...arcs[i], innerRadius, outerRadius }) ?? '';
      return { ...data, d, color: color(data.name) };
    });
  }, [size, sortedData]);

  return (
    <div className={styles.pieChart}>
      <svg width={size} height={size} {...props}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {pathData.map((data) => (
            <path key={data.name} d={data.d} fill={data.color} className={styles.path} />
          ))}
        </g>
      </svg>
    </div>
  );
}
