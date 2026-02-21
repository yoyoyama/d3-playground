import * as d3 from 'd3';
import type { ArcChartData } from '../components/ArcChart';
import type { BarChartData } from '../components/BarChart';
import type { LineChartData } from '../components/LineChart';
import type { PieChartData } from '../components/PieChart';
import type { StackedBarChartData } from '../components/StackedBarChart';

export const fruits = [
  { id: 'apple', label: 'Apple' },
  { id: 'blueberry', label: 'Blueberry' },
  { id: 'grape', label: 'Grape' },
  { id: 'muscat', label: 'Muscat' },
  { id: 'orange', label: 'Orange' },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
const to = new Date(today.getFullYear(), today.getMonth(), 0); // 前月の最終日
const from = new Date(to.getFullYear(), to.getMonth(), 1); // 前月の初日

export const period: [Date, Date] = [from, to];

export function generateArcChartData(): ArcChartData {
  return Math.random();
}

export function generateBarChartData(): BarChartData {
  return fruits.map((fruit) => ({ ...fruit, value: Math.round(Math.random() * 3000) }));
}

export function generateLineChartData(): LineChartData {
  const dates = d3.scaleTime().domain(period).ticks(d3.timeDay);

  return dates.map((date) => {
    const items = structuredClone(fruits).map((fruit, i, array) => ({
      ...fruit,
      value: Math.round(Math.random() * 1000) + (array.length - 1 - i) * 500,
    }));
    return { date, items };
  });
}

export function generatePieChartData(): PieChartData {
  return fruits.map((fruit) => ({ ...fruit, value: Math.round(Math.random() * 3000) }));
}

export function generateStackedBarChartData(): StackedBarChartData {
  const dates = d3.scaleTime().domain(period).ticks(d3.timeDay);

  return dates.map((date) => {
    const items = structuredClone(fruits).map((fruit) => ({
      ...fruit,
      value: Math.round(Math.random() * 500),
    }));
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return { date, items, total };
  });
}
