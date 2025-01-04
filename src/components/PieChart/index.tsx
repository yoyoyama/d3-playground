import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './PieChart.module.css';

export type PieChartData = {
  id: string;
  label: string;
  value: number;
}[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: PieChartData;
  size?: number;
};

export function PieChart({ data, size = 240, ...props }: Props) {
  const sortedData = useMemo(() => {
    return data.toSorted((a, b) => (a.value > b.value ? -1 : 1));
  }, [data]);

  const pieSize = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = 0;

    return { outerRadius, innerRadius };
  }, [size]);

  const pieData = useMemo(() => {
    const arc = d3.arc();
    const pie = d3.pie().sort(null);
    const arcs = pie(sortedData.map((d) => d.value));

    return sortedData.map((data, i) => {
      const d =
        arc({
          ...arcs[i],
          innerRadius: pieSize.innerRadius,
          outerRadius: pieSize.outerRadius,
        }) ?? '';
      return { ...data, d };
    });
  }, [pieSize, sortedData]);

  return (
    <div className={styles.pieChart} {...props}>
      <svg width={size} height={size}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {pieData.map((data) => (
            <path key={data.id} d={data.d} data-id={data.id} className={styles.path} />
          ))}
        </g>
      </svg>
    </div>
  );
}
