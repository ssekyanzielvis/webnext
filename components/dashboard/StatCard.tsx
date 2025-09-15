import { IconType } from 'react-icons'

interface StatCardProps {
  title: string
  value: string | number
  icon: IconType
  color: string
}

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  return (
    <div className={`rounded-lg p-6 ${color} text-white`}>
      <div className="flex flex-col items-center justify-center space-y-2">
        <Icon className="h-8 w-8" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium text-center">{title}</div>
      </div>
    </div>
  )
}
