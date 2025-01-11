import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';

import styles from './Tooltip.module.css';
import { createPortal } from 'react-dom';

type Props = ComponentPropsWithoutRef<'div'> & {
  offset?: number;
  x: number;
  y: number;
};

export function Tooltip({ children, offset = 16, style, x, y, ...props }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
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

    setTooltipStyle(newTooltipStyle);
  }, [x, y, offset]);

  return createPortal(
    <div
      className={styles.tooltip}
      ref={tooltipRef}
      style={{ ...style, ...tooltipStyle }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}
