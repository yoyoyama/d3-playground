import { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ArcChart } from './components/ArcChart';
import { BarChart } from './components/BarChart';
import { LineChart } from './components/LineChart';
import { PieChart } from './components/PieChart';
import type { ArcChartData } from './components/ArcChart';
import type { BarChartData } from './components/BarChart';
import type { LineChartData } from './components/LineChart';
import type { PieChartData } from './components/PieChart';

import styles from './App.module.css';
import githubIcon from './assets/img/github.svg';

const fruits = [
  { id: 'apple', label: 'Apple' },
  { id: 'blueberry', label: 'Blueberry' },
  { id: 'grape', label: 'Grape' },
  { id: 'muscat', label: 'Muscat' },
  { id: 'orange', label: 'Orange' },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
const to = new Date(today.getFullYear(), today.getMonth(), 2); // 前月の最終日
const from = new Date(to.getFullYear(), to.getMonth(), 1); // 前月の初日
const period: [Date, Date] = [from, to];

export default function App() {
  const [arcChartData, setArcChartData] = useState<ArcChartData>(0);
  const [barChartData, setBarChartData] = useState<BarChartData>([]);
  const [lineChartData, setLineChartData] = useState<LineChartData>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData>([]);

  const generateArcChartData = useCallback(() => {
    setArcChartData(Math.random());
  }, []);

  const generateBarChartData = useCallback(() => {
    const data = fruits.map((fruit) => ({ ...fruit, value: Math.round(Math.random() * 3000) }));

    setBarChartData(data);
  }, []);

  const generateLineChartData = useCallback(() => {
    const dates = d3.scaleTime().domain(period).ticks(d3.timeDay);

    const data = dates.map((date) => {
      const items = structuredClone(fruits)
        .reverse()
        .map((path, i) => ({
          ...path,
          value: Math.round(Math.random() * 1000) + i * 500, // iが0: 0～1000、1: 500～1500、2: 1000～2000、3: 1500～2500、4: 2000～3000の範囲で乱数を生成する
        }));

      return { date, items };
    });

    setLineChartData(data);
  }, []);

  const generatePieChartData = useCallback(() => {
    const data = fruits.map((fruit) => ({ ...fruit, value: Math.round(Math.random() * 3000) }));

    setPieChartData(data);
  }, []);

  const generateData = useCallback(() => {
    generateArcChartData();
    generateBarChartData();
    generateLineChartData();
    generatePieChartData();
  }, [generateArcChartData, generateBarChartData, generateLineChartData, generatePieChartData]);

  useEffect(() => {
    generateData();
  }, [generateData]);

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
      </main>
      <footer className={styles.footer}>
        <a href="https://github.com/yoyoyama/d3-playground">
          <img src={githubIcon} width="24" height="24" alt="" />
        </a>
      </footer>
    </div>
  );
}
