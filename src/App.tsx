import { useCallback, useEffect, useState } from 'react';
import { Arc } from './components/Arc';
import type { Data as ArcData } from './components/Arc';

import styles from './App.module.css';

export default function App() {
  const [arcData, setArcData] = useState<ArcData>(0);

  const generateArcData = useCallback(() => {
    const data = Math.random();
    setArcData(data);
  }, []);

  const generateData = useCallback(() => {
    generateArcData();
  }, [generateArcData]);

  useEffect(() => {
    generateData();
  }, [generateData]);

  return (
    <>
      <header className={styles.header}>
        <h1>d3-playground</h1>
        <button type="button" onClick={generateData}>
          Regenerate Data
        </button>
      </header>
      <main className={styles.main}>
        <section>
          <h2>Arc</h2>
          <Arc data={arcData} />
        </section>
      </main>
    </>
  );
}
