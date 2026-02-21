import { useCallback, useState } from 'react';
import { ArcChart } from './components/ArcChart';
import { BarChart } from './components/BarChart';
import { LineChart } from './components/LineChart';
import { PieChart } from './components/PieChart';
import { StackedBarChart } from './components/StackedBarChart';
import type { ArcChartData } from './components/ArcChart';
import type { BarChartData } from './components/BarChart';
import type { LineChartData } from './components/LineChart';
import type { PieChartData } from './components/PieChart';
import type { StackedBarChartData } from './components/StackedBarChart';
import {
  generateArcChartData,
  generateBarChartData,
  generateLineChartData,
  generatePieChartData,
  generateStackedBarChartData,
  period,
} from './mocks/charts';

import styles from './App.module.css';
import githubIcon from './assets/img/github.svg';

export default function App() {
  const [arcChartData, setArcChartData] = useState<ArcChartData>(generateArcChartData);
  const [barChartData, setBarChartData] = useState<BarChartData>(generateBarChartData);
  const [lineChartData, setLineChartData] = useState<LineChartData>(generateLineChartData);
  const [pieChartData, setPieChartData] = useState<PieChartData>(generatePieChartData);
  const [stackedBarChartData, setStackedBarChartData] = useState<StackedBarChartData>(
    generateStackedBarChartData,
  );

  const generateData = useCallback(() => {
    setArcChartData(generateArcChartData());
    setBarChartData(generateBarChartData());
    setLineChartData(generateLineChartData());
    setPieChartData(generatePieChartData());
    setStackedBarChartData(generateStackedBarChartData());
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>d3-playground</h1>
        <button type="button" className={styles.button} onClick={generateData}>
          Regenerate Data
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.heading}>Arc Chart</h2>
          <ArcChart data={arcChartData} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.heading}>Pie Chart</h2>
          <PieChart data={pieChartData} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.heading}>Bar Chart</h2>
          <BarChart data={barChartData} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.heading}>Line Chart</h2>
          <LineChart data={lineChartData} period={period} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.heading}>Stacked Bar Chart</h2>
          <StackedBarChart data={stackedBarChartData} period={period} />
        </section>
      </main>
      <footer className={styles.footer}>
        <a href="https://github.com/moyoyama/d3-playground">
          <img src={githubIcon} width="24" height="24" alt="" />
        </a>
      </footer>
    </div>
  );
}
