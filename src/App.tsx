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

const fruits = [
  { id: 'apple', label: 'Apple' },
  { id: 'blueberry', label: 'Blueberry' },
  { id: 'grape', label: 'Grape' },
  { id: 'muscat', label: 'Muscat' },
  { id: 'orange', label: 'Orange' },
];

export default function App() {
  const period = useMemo<[Date, Date]>(() => [new Date(2024, 11, 15), new Date(2025, 0, 15)], []);
  const [arcChartData, setArcChartData] = useState<ArcChartData>(0);
  const [barChartData, setBarChartData] = useState<BarChartData>([]);
  const [lineChartData, setLineChartData] = useState<LineChartData>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData>([]);

  const generateArcChartData = useCallback(() => {
    setArcChartData(Math.random());
  }, []);

  const generateBarChartData = useCallback(() => {
    const data = fruits.map((fruit) => ({ ...fruit, value: Math.random() * 100 }));

    setBarChartData(data);
  }, []);

  const generateLineChartData = useCallback(() => {
    const dates = d3.scaleTime().domain(period).ticks(d3.timeDay);

    const data = structuredClone(fruits)
      .reverse()
      .map((path, i) => ({
        ...path,
        dates: dates.map((date) => {
          // iが0: 0～20、1: 20～40、2: 40～60、3: 60～80、4: 80～100の範囲で乱数を生成する
          const value = Math.random() * 20 + 20 * i;
          return { date, value };
        }),
      }));

    setLineChartData(data);
  }, [period]);

  const generatePieChartData = useCallback(() => {
    const data = fruits.map((fruit) => ({ ...fruit, value: Math.random() * 100 }));

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
    <>
      <header className={styles.header}>
        <h1>d3-playground</h1>
        <button type="button" onClick={generateData}>
          Regenerate Data
        </button>
      </header>
      <main className={styles.main}>
        <section>
          <h2>Arc Chart</h2>
          <ArcChart data={arcChartData} />
        </section>
        <section>
          <h2>Pie Chart</h2>
          <PieChart data={pieChartData} />
        </section>
        <section>
          <h2>Bar Chart</h2>
          <BarChart data={barChartData} />
        </section>
        <section>
          <h2>Line Chart</h2>
          <LineChart data={lineChartData} period={period} />
        </section>
      </main>
    </>
  );
}
