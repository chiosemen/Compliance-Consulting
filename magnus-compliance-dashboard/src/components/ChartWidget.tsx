'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export interface DonorFlowData {
  nodes: {
    label: string;
    color?: string;
  }[];
  links: {
    source: number;
    target: number;
    value: number;
    color?: string;
  }[];
}

export interface ChartWidgetProps {
  title: string;
  type: 'sankey' | 'bar' | 'line' | 'pie';
  data: DonorFlowData | any;
  height?: number;
}

export default function ChartWidget({
  title,
  type,
  data,
  height = 400,
}: ChartWidgetProps) {
  const chartData = useMemo(() => {
    if (type === 'sankey') {
      const flowData = data as DonorFlowData;
      return [
        {
          type: 'sankey',
          orientation: 'h',
          node: {
            pad: 15,
            thickness: 20,
            line: {
              color: 'rgba(255, 255, 255, 0.2)',
              width: 0.5,
            },
            label: flowData.nodes.map((n) => n.label),
            color: flowData.nodes.map(
              (n) => n.color || 'rgba(22, 163, 74, 0.8)'
            ),
          },
          link: {
            source: flowData.links.map((l) => l.source),
            target: flowData.links.map((l) => l.target),
            value: flowData.links.map((l) => l.value),
            color: flowData.links.map(
              (l) => l.color || 'rgba(22, 163, 74, 0.3)'
            ),
          },
        },
      ];
    }

    if (type === 'bar') {
      return [
        {
          type: 'bar',
          x: data.x || [],
          y: data.y || [],
          marker: {
            color: data.colors || 'rgba(22, 163, 74, 0.8)',
            line: {
              color: 'rgba(22, 163, 74, 1)',
              width: 1,
            },
          },
          hovertemplate: '<b>%{x}</b><br>%{y:$,.0f}<extra></extra>',
        },
      ];
    }

    if (type === 'line') {
      return [
        {
          type: 'scatter',
          mode: 'lines+markers',
          x: data.x || [],
          y: data.y || [],
          line: {
            color: 'rgba(22, 163, 74, 1)',
            width: 3,
          },
          marker: {
            color: 'rgba(22, 163, 74, 1)',
            size: 8,
            line: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2,
            },
          },
          hovertemplate: '<b>%{x}</b><br>%{y:$,.0f}<extra></extra>',
        },
      ];
    }

    if (type === 'pie') {
      return [
        {
          type: 'pie',
          labels: data.labels || [],
          values: data.values || [],
          marker: {
            colors: data.colors || [
              'rgba(22, 163, 74, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(59, 130, 246, 0.8)',
            ],
            line: {
              color: 'rgba(255, 255, 255, 0.2)',
              width: 2,
            },
          },
          textinfo: 'label+percent',
          textfont: {
            color: '#fff',
          },
          hovertemplate: '<b>%{label}</b><br>%{value:$,.0f}<br>%{percent}<extra></extra>',
        },
      ];
    }

    return [];
  }, [type, data]);

  const layout = useMemo(() => {
    const baseLayout: any = {
      paper_bgcolor: 'rgba(255, 255, 255, 0.05)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        family: 'Arial, Helvetica, sans-serif',
        size: 12,
        color: 'rgba(255, 255, 255, 0.8)',
      },
      margin: { l: 40, r: 40, t: 20, b: 40 },
      height,
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        bordercolor: 'rgba(22, 163, 74, 0.5)',
        font: {
          color: '#fff',
          size: 13,
        },
      },
    };

    if (type === 'bar' || type === 'line') {
      baseLayout.xaxis = {
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        zeroline: false,
      };
      baseLayout.yaxis = {
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        zeroline: false,
      };
    }

    if (type === 'pie') {
      baseLayout.showlegend = true;
      baseLayout.legend = {
        font: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        bgcolor: 'rgba(0, 0, 0, 0)',
      };
    }

    return baseLayout;
  }, [type, height]);

  const config = useMemo(
    () => ({
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-brand/40 transition-colors"
    >
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-white mb-4"
      >
        {title}
      </motion.h3>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-lg overflow-hidden"
      >
        <Plot data={chartData} layout={layout} config={config} style={{ width: '100%' }} />
      </motion.div>
    </motion.div>
  );
}

// Example donor flow data generator
export function generateSampleDonorFlow(): DonorFlowData {
  return {
    nodes: [
      { label: 'Individual Donors', color: 'rgba(22, 163, 74, 0.8)' },
      { label: 'Corporate Donors', color: 'rgba(245, 158, 11, 0.8)' },
      { label: 'Foundation Grants', color: 'rgba(59, 130, 246, 0.8)' },
      { label: 'Program A', color: 'rgba(168, 85, 247, 0.8)' },
      { label: 'Program B', color: 'rgba(236, 72, 153, 0.8)' },
      { label: 'Operations', color: 'rgba(239, 68, 68, 0.8)' },
      { label: 'Research', color: 'rgba(20, 184, 166, 0.8)' },
    ],
    links: [
      { source: 0, target: 3, value: 250000, color: 'rgba(22, 163, 74, 0.3)' },
      { source: 0, target: 4, value: 150000, color: 'rgba(22, 163, 74, 0.3)' },
      { source: 0, target: 5, value: 100000, color: 'rgba(22, 163, 74, 0.3)' },
      { source: 1, target: 3, value: 500000, color: 'rgba(245, 158, 11, 0.3)' },
      { source: 1, target: 6, value: 300000, color: 'rgba(245, 158, 11, 0.3)' },
      { source: 2, target: 4, value: 400000, color: 'rgba(59, 130, 246, 0.3)' },
      { source: 2, target: 6, value: 350000, color: 'rgba(59, 130, 246, 0.3)' },
    ],
  };
}
