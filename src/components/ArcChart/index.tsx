import { ComponentPropsWithoutRef, useMemo } from 'react';
import * as d3 from 'd3';

import styles from './ArcChart.module.css';

export type ArcChartData = number;

type Props = ComponentPropsWithoutRef<'div'> & {
  data: ArcChartData;
  size?: number;
};

export function ArcChart({ data, size = 240, ...props }: Props) {
  const label = useMemo(() => {
    return (data * 100).toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  }, [data]);

  const arcSize = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.75;

    return { outerRadius, innerRadius };
  }, [size]);

  const arcData = useMemo(() => {
    const arc = d3.arc().cornerRadius(16);
    const tau = 2 * Math.PI;

    const backArc = arc({ ...arcSize, startAngle: 0, endAngle: tau }) ?? '';
    const frontArc = arc({ ...arcSize, startAngle: 0, endAngle: data * tau }) ?? '';

    // 0.5以上とそれ以外で色を変える
    const frontStatus = data >= 0.5 ? 'good' : 'bad';

    return {
      back: { d: backArc },
      front: { d: frontArc, status: frontStatus },
    };
  }, [arcSize, data]);

  return (
    <div className={styles.arcChart} {...props}>
      <svg width={size} height={size}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <path d={arcData.back.d} className={styles.backArc} />
          <path
            d={arcData.front.d}
            data-status={arcData.front.status}
            className={styles.frontArc}
          />
        </g>
      </svg>
      <p className={styles.label}>
        <span className={styles.value}>{label}</span>%
      </p>
    </div>
  );
}
