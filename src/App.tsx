import { useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Arc } from './components/Arc';
import { PieChart } from './components/PieChart';
import type { ArcData } from './components/Arc';
import type { PieChartData } from './components/PieChart';

import styles from './App.module.css';

export default function App() {
  const [arcData, setArcData] = useState<ArcData>(0);
  const [pieChartData, setPieChartData] = useState<PieChartData>([]);

  const generateArcData = useCallback(() => {
    const data = Math.random();
    setArcData(data);
  }, []);

  const generatePieChartData = useCallback(() => {
    const fruits = ['Apple', 'Blueberry', 'Grape', 'Muscat', 'Orange'];
    const data = fruits.map((fruit) => ({ name: fruit, value: Math.random() * 100 }));
    setPieChartData(data);
  }, []);

  const generateData = useCallback(() => {
    generateArcData();
    generatePieChartData();
  }, [generateArcData, generatePieChartData]);

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
        <section>
          <h2>Pie Chart</h2>
          <PieChart data={pieChartData} />
        </section>
      </main>
    </>
  );
}
