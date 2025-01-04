import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './Arc.module.css';

export type ArcData = number;

type Props = ComponentPropsWithoutRef<'svg'> & {
  data: ArcData;
  size?: number;
};

export function Arc({ data, size = 240, ...props }: Props) {
  const label = useMemo(() => {
    return (data * 100).toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  }, [data]);

  const pathData = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.75;
    const arc = d3.arc().cornerRadius(16);
    const tau = 2 * Math.PI;

    const back = arc({ innerRadius, outerRadius, startAngle: 0, endAngle: tau }) ?? '';

    const front = arc({ innerRadius, outerRadius, startAngle: 0, endAngle: data * tau }) ?? '';

    return { back, front };
  }, [data, size]);

  return (
    <div className={styles.arc}>
      <svg width={size} height={size} {...props}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <path d={pathData.back} className={styles.backPath} />
          <path d={pathData.front} className={styles.frontPath} />
        </g>
      </svg>
      <p className={styles.label}>
        <span className={styles.value}>{label}</span>%
      </p>
    </div>
  );
}
