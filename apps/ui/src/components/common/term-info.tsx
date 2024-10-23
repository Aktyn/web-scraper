import { mdiInformation } from '@mdi/js'
import Icon from '@mdi/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { TERMS_DETAILS, type TermKey } from '~/lib/terms'

type TermInfoProps = {
  term: TermKey
  className?: string
}

export function TermInfo({ term: termKey, className }: TermInfoProps) {
  const term = TERMS_DETAILS.find((t) => t.key === termKey)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon path={mdiInformation} className={className} />
      </TooltipTrigger>
      <TooltipContent className="whitespace-pre-wrap text-left font-semibold max-w-screen-xs">
        <p className="font-bold">{term?.title}</p>
        <span className="font-medium">{term?.content}</span>
      </TooltipContent>
    </Tooltip>
  )
}
