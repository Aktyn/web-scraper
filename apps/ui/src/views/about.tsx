import { mdiGithub } from '@mdi/js'
import Icon from '@mdi/react'
import 'devicon/devicon.min.css'
import aktynLogo from '~/assets/aktyn-logo.png'
import { LabeledSeparator } from '~/components/common/labeled-separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { TERMS_DETAILS } from '~/lib/terms'

export function About() {
  return (
    <ScrollArea className="min-h-full max-h-full flex flex-col items-center justify-center">
      <div className="w-full h-full inline-grid grid-rows-[auto_auto] grid-cols-[1fr] items-center justify-center p-0 xs:p-4 md:p-8 gap-y-4 md:gap-y-8">
        <Card className="max-w-(--breakpoint-sm) w-full mx-auto overflow-hidden animate-in zoom-in spin-in duration-500">
          <CardHeader className="flex flex-col items-center">
            <CardTitle>Web Scraper</CardTitle>
            <CardDescription className="w-auto text-center">
              Project created to better automate web operations.
              <br />
              It can be used for advanced website testing, data mining, scraping, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-stretch gap-y-6">
            <AuthorSection />
            <TechnologiesSection />
          </CardContent>
        </Card>
        <Card className="max-w-(--breakpoint-sm) w-full mx-auto overflow-hidden animate-in zoom-in spin-in duration-500 delay-100">
          <CardHeader className="flex flex-col items-center">
            <CardTitle>Terminology</CardTitle>
            <CardDescription className="w-auto text-center">
              Explanation of terms used in the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-stretch gap-y-6">
            <Accordion type="multiple">
              {TERMS_DETAILS.map(({ key, title, content }) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="font-semibold">
                    <span className="w-4" />
                    {title}
                  </AccordionTrigger>
                  <AccordionContent className="text-justify whitespace-pre-wrap">
                    {content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col items-stretch gap-y-2">{children}</section>
}

function AuthorSection() {
  return (
    <Section>
      <LabeledSeparator className="text-base text-muted-foreground">Author</LabeledSeparator>
      <div className="flex flex-col items-center">
        <img src={aktynLogo} alt="Aktyn" className="size-12 rounded-full mb-2" />
        <div className="text-lg font-bold text-center">
          Radosław Krajewski
          <br />
        </div>
        <div className="inline-flex *:not-data-[orientation]:flex-1 items-center justify-center gap-x-2">
          <span className="text-base font-medium text-center px-4">Aktyn</span>
          <Separator orientation="vertical" className="h-8!" />
          <Button variant="link" asChild className="gap-x-1">
            <a href="https://github.com/Aktyn" target="_blank">
              <Icon path={mdiGithub} />
              &nbsp;GitHub
            </a>
          </Button>
        </div>
      </div>
    </Section>
  )
}

function TechnologiesSection() {
  return (
    <Section>
      <LabeledSeparator className="text-base text-muted-foreground">
        Used technologies
      </LabeledSeparator>
      <ScrollArea className="max-w-full mx-auto">
        <div className="[&_i]:text-4xl flex flex-row justify-center px-2 gap-x-4">
          {technologies.map(({ name, icon }) => (
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <i className={icon}></i>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Section>
  )
}

const technologies = [
  { name: 'NodeJS', icon: 'devicon-nodejs-plain' },
  { name: 'TypeScript', icon: 'devicon-typescript-plain' },
  { name: 'React', icon: 'devicon-react-original' },
  { name: 'TailwindCSS', icon: 'devicon-tailwindcss-plain' },
  { name: 'Vite', icon: 'devicon-vitejs-plain' },
  { name: 'Electron', icon: 'devicon-electron-original' },
  { name: 'Prisma', icon: 'devicon-prisma-plain' },
  { name: 'Git', icon: 'devicon-git-plain' },
] as const
