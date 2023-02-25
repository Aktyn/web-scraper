import { LinkRounded } from '@mui/icons-material'
import { Avatar, Link, Stack, Typography } from '@mui/material'
import { InfoContentBase } from './InfoContentBase'
import aktynLogo from '../../img/aktyn_logo.png'
import droniLogo from '../../img/droni_logo.png'

export const AboutProject = () => {
  return <InfoContentBase sections={aboutSections} />
}

interface PersonInfoProps {
  name: string
  logoIcon: string
  links?: { name: string; url: string }[]
}

const PersonInfo = ({ name, logoIcon, links }: PersonInfoProps) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
      <Avatar alt="person logo" src={logoIcon} sx={{ width: 48, height: 48 }} />
      <Typography variant="body1" fontWeight="bold">
        {name}
      </Typography>
      <Stack>
        {links?.map(({ name, url }) => (
          <Link
            key={url}
            href={url}
            target="_blank"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              display: 'inline-flex',
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 0.5,
              transition: (theme) => theme.transitions.create('color'),
              '&:hover': {
                color: (theme) => theme.palette.text.primary,
              },
            }}
          >
            <LinkRounded fontSize="inherit" />
            <Typography variant="body2">{name}</Typography>
          </Link>
        ))}
      </Stack>
    </Stack>
  )
}

const aboutSections = [
  {
    title: 'Author',
    content: (
      <PersonInfo
        name="Aktyn"
        logoIcon={aktynLogo}
        links={[{ name: 'GitHub', url: 'https://github.com/Aktyn' }]}
      />
    ),
  },
  {
    title: 'Contributors',
    content: (
      <PersonInfo
        name="dxdroni"
        logoIcon={droniLogo}
        links={[
          { name: 'GitHub', url: 'https://github.com/xdroni' },
          { name: 'YouTube', url: 'https://www.youtube.com/c/dxdroni' },
        ]}
      />
    ),
  },
  {
    title: 'Project purpose',
    content: 'TODO',
  },
]
