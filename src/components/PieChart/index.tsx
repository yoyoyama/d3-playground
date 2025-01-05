import { ComponentPropsWithoutRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip } from '../Tooltip';

import styles from './PieChart.module.css';

type Piece = {
  id: string;
  label: string;
  value: number;
};

export type PieChartData = Piece[];

type Props = ComponentPropsWithoutRef<'div'> & {
  data: PieChartData;
  size?: number;
};

export function PieChart({ data, size = 240, ...props }: Props) {
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tooltipIsVisible, setTooltipIsVisible] = useState<boolean>(false);

  const sortedData = useMemo(() => {
    return data.sort((a, b) => (a.value > b.value ? -1 : 1));
  }, [data]);

  const pieSize = useMemo(() => {
    const outerRadius = size / 2;
    const innerRadius = 0;

    return { outerRadius, innerRadius };
  }, [size]);

  const pieData = useMemo(() => {
    const pie = d3
      .pie<Piece>()
      .sort(null)
      .value((datum) => datum.value);
    const arcs = pie(sortedData);
    const arc = d3.arc();

    return sortedData.map((datum, i) => {
      const d = arc({ ...pieSize, ...arcs[i] }) ?? '';
      return { ...datum, d };
    });
  }, [pieSize, sortedData]);

  const tooltipData = useMemo(() => {
    return data.map((datum) => {
      return { ...datum, value: datum.value.toLocaleString('ja-JP') };
    });
  }, [data]);

  const handleMouseEnter = useCallback(() => {
    setTooltipIsVisible(true);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipIsVisible(false);
  }, []);

  return (
    <div className={styles.pieChart} {...props}>
      <svg width={size} height={size}>
        <g
          transform={`translate(${size / 2}, ${size / 2})`}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {pieData.map((datum) => (
            <path key={datum.id} d={datum.d} data-id={datum.id} className={styles.arc} />
          ))}
        </g>
      </svg>
      {tooltipIsVisible && (
        <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
          <ul className={styles.tooltipList}>
            {tooltipData.map((datum) => (
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
