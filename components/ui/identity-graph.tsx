"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface IdentityGraphProps {
  data: {
    date: string;
    score: number;
  }[];
}

export function IdentityGraph({ data }: IdentityGraphProps) {
  // 1. Fallback for new users with no prediction history yet
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center border border-dashed border-zinc-800 rounded-sm text-zinc-600 font-mono text-xs uppercase tracking-widest bg-zinc-950/30">
        // INSUFFICIENT_DATA_FOR_TRAJECTORY
      </div>
    );
  }

  return (
    // 2. Removed the redundant outer box styles since gigascore/page.tsx handles the container
    <div className="w-full h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {/* 3. The sick red gradient glow under the line */}
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Subtle background grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            fontFamily="monospace"
            dy={10} // Pushes the text down slightly
          />
          
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            fontFamily="monospace"
            // 4. Dynamic Domain: Zooms in so even a 5 point change looks massive
            domain={['dataMin - 15', 'dataMax + 15']} 
            tickFormatter={(value) => Math.round(value).toString()}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', // zinc-950
              borderColor: '#27272a', // zinc-800
              color: '#f4f4f5', // zinc-100
              fontFamily: 'monospace',
              fontSize: '12px',
              textTransform: 'uppercase',
              borderRadius: '0.125rem'
            }}
            itemStyle={{ color: '#ef4444', fontWeight: 'bold' }} // Red text for the score
            formatter={(value: number) => [Math.round(value), 'GigaScore']}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#ef4444" // Tailwind red-500
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500} // Smooth load-in animation
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}