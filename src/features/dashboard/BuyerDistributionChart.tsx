import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Buyer } from '@/types'
import { getCountryFlag } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

interface Props {
  buyers: Buyer[]
}

export function BuyerDistributionChart({ buyers }: Props) {
  const countryMap = buyers.reduce<Record<string, number>>((acc, b) => {
    acc[b.country] = (acc[b.country] ?? 0) + 1
    return acc
  }, {})

  const data = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => {
      const buyer = buyers.find(b => b.country === country)
      return {
        name: `${getCountryFlag(buyer?.countryCode ?? 'XX')} ${country}`,
        value: count,
      }
    })

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-72">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">국가별 바이어 분포</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}개사`, '바이어 수']} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
