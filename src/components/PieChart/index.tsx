import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './PieChart.module.css';

type Pie = {
  id: string;
  label: string;
  value: number;
};

export type PieChartData = Pie[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: PieChartData;
  size?: number;
};

export function PieChart({ data, size = 240, ...props }: Props) {
  const pieSize = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = 0;

    return { outerRadius, innerRadius };
  }, [size]);

  const pieData = useMemo(() => {
    const pie = d3
      .pie<Pie>()
      .sort((a, b) => (a.value > b.value ? -1 : 1))
      .value((datum) => datum.value);
    const arcs = pie(data);
    const arc = d3.arc();

    return data.map((datum, i) => {
      const d = arc({ ...pieSize, ...arcs[i] }) ?? '';
      return { ...datum, d };
    });
  }, [pieSize, data]);

  return (
    <div className={styles.pieChart} {...props}>
      <svg width={size} height={size}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {pieData.map((data) => (
            <path key={data.id} d={data.d} data-id={data.id} className={styles.arc} />
          ))}
        </g>
      </svg>
    </div>
  );
}
