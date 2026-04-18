import { cn } from '@/lib/utils'
import type { DietaryTag } from '@/lib/constants'
import { DIETARY_TAGS } from '@/lib/constants'

const tagStyles: Record<DietaryTag, string> = {
  vegetarian: 'bg-dietary-vegetarian-bg text-dietary-vegetarian-text',
  vegan: 'bg-dietary-vegan-bg text-dietary-vegan-text',
  halal: 'bg-dietary-halal-bg text-dietary-halal-text',
  'gluten-free': 'bg-dietary-gluten-free-bg text-dietary-gluten-free-text',
  'contains-nuts': 'bg-dietary-nuts-bg text-dietary-nuts-text',
  'contains-dairy': 'bg-dietary-dairy-bg text-dietary-dairy-text',
}

interface DietaryTagsProps {
  tags: DietaryTag[]
  className?: string
}

export default function DietaryTags({ tags, className }: DietaryTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium',
            tagStyles[tag] ?? 'bg-gray-100 text-gray-600',
          )}
        >
          {DIETARY_TAGS[tag]}
        </span>
      ))}
    </div>
  )
}
