import { mdiGithub } from '@mdi/js'
import Icon from '@mdi/react'
import { Button } from '~/components/ui/button'

export function About() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <div className="text-lg font-bold">
        Radosław Krajewski <span className="text-base text-muted-foreground">(Aktyn)</span>
      </div>
      <Button variant="link" asChild>
        <a href="https://github.com/Aktyn" target="_blank">
          <Icon path={mdiGithub} />
          &nbsp;GitHub
        </a>
      </Button>
    </div>
  )
}
