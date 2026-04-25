import Link from 'next/link'
import { FileText, Video, ClipboardList, Package } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

const typeIcons: Record<string, any> = {
  PDF: FileText, VIDEO: Video, MOCK_TEST: ClipboardList, BUNDLE: Package,
}
const typeColors: Record<string, any> = {
  PDF: 'info', VIDEO: 'success', MOCK_TEST: 'warning', BUNDLE: 'default',
}

interface Props {
  content: {
    id: string
    title: string
    description?: string | null
    type: string
    subject?: string | null
    thumbnail?: string | null
    isFeatured: boolean
    plans: { plan: { id: string; name: string; price: number } }[]
  }
}

export default function ContentCard({ content }: Props) {
  const Icon = typeIcons[content.type] ?? FileText
  const lowestPrice = content.plans.length > 0
    ? Math.min(...content.plans.map(p => p.plan.price))
    : null

  return (
    <Link href={`/store/${content.id}`}
      className="group bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-primary-700 transition flex flex-col">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-36 flex items-center justify-center border-b border-gray-800">
        <Icon size={48} className="text-gray-600 group-hover:text-primary-500 transition" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-200 text-sm line-clamp-2 group-hover:text-white transition">{content.title}</h3>
          {content.isFeatured && <Badge variant="info" className="shrink-0">Featured</Badge>}
        </div>
        {content.subject && <p className="text-xs text-gray-500 mb-2">{content.subject}</p>}
        {content.description && <p className="text-xs text-gray-600 line-clamp-2 mb-3">{content.description}</p>}
        <div className="mt-auto flex items-center justify-between">
          <Badge variant={typeColors[content.type]}>{content.type.replace('_', ' ')}</Badge>
          {lowestPrice !== null && (
            <span className="text-sm font-bold text-primary-400">{formatCurrency(lowestPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
