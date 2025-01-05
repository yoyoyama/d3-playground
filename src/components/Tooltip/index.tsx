import { ComponentPropsWithoutRef } from 'react';

import styles from './Tooltip.module.css';

type Props = ComponentPropsWithoutRef<'div'>;

export function Tooltip({ children, ...props }: Props) {
  return (
    <div className={styles.tooltip} {...props}>
      {children}
    </div>
  );
}
