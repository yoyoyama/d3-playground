import { ComponentPropsWithoutRef, useLayoutEffect, useRef } from 'react';

import styles from './Tooltip.module.css';
import { createPortal } from 'react-dom';

type Props = ComponentPropsWithoutRef<'div'> & {
  offset?: number;
  x: number;
  y: number;
};

export function Tooltip({ children, offset = 16, x, y, ...props }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!tooltipRef.current) return;

    const newTooltipStyle = {
      transform: `translate(${x + offset}px, ${y}px)`,
      opacity: '1',
    };
    const { width } = tooltipRef.current.getBoundingClientRect();

    // ツールチップが画面外にはみ出る場合は位置を調整する
    if (x + offset + width > document.documentElement.clientWidth) {
      newTooltipStyle.transform = `translate(${x - offset - width}px, ${y}px)`;
    }

    tooltipRef.current.style.transform = newTooltipStyle.transform;
    tooltipRef.current.style.opacity = newTooltipStyle.opacity;
  }, [x, y, offset]);

  return createPortal(
    <div className={styles.tooltip} ref={tooltipRef} {...props}>
      {children}
    </div>,
    document.body,
  );
}
