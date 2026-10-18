import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Legend, Tooltip);

export const PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const baseOptions = (yLabel) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
  },
  scales: {
    x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
    y: { beginAtZero: true, title: { display: Boolean(yLabel), text: yLabel } },
  },
});

// series: [{ label, data: [{ date, value }] }]
export const LineChart = ({ series, yLabel, height = 320, fill = false }) => {
  const dates = [...new Set(series.flatMap((s) => s.data.map((p) => p.date)))].sort();
  const data = {
    labels: dates,
    datasets: series.map((s, i) => {
      const byDate = new Map(s.data.map((p) => [p.date, p.value]));
      const color = s.color || PALETTE[i % PALETTE.length];
      return {
        label: s.label,
        data: dates.map((d) => byDate.get(d) ?? null),
        borderColor: color,
        backgroundColor: `${color}22`,
        fill,
        spanGaps: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.25,
      };
    }),
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={baseOptions(yLabel)} />
    </div>
  );
};

export const BarChart = ({ labels, values, label, height = 320 }) => (
  <div style={{ height }}>
    <Bar
      data={{ labels, datasets: [{ label, data: values, backgroundColor: PALETTE[0], borderRadius: 6 }] }}
      options={{ ...baseOptions(), indexAxis: 'y', plugins: { legend: { display: false } } }}
    />
  </div>
);
