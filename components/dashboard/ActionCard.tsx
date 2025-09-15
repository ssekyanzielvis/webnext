import Link from 'next/link'
import { IconType } from 'react-icons'

interface ActionCardProps {
  title: string
  icon: IconType
  color: string
  href: string
}

export const ActionCard = ({ title, icon: Icon, color, href }: ActionCardProps) => {
  return (
    <Link href={href}>
      <div className={`rounded-lg p-6 ${color} text-white cursor-pointer transition-transform hover:scale-105`}>
        <div className="flex flex-col items-center justify-center space-y-2">
          <Icon className="h-8 w-8" />
          <div className="text-sm font-bold text-center">{title}</div>
        </div>
      </div>
    </Link>
  )
}
