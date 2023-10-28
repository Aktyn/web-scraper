import { useEffect, useRef, useState } from 'react'
import { ErrorRounded, OpenInFullRounded } from '@mui/icons-material'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { tryParseJSON } from '@web-scraper/common'
import * as prism from 'prismjs'
import { CustomPopover, type CustomPopoverRef } from './CustomPopover'

import 'prismjs/components/prism-json.js'
import 'prismjs/themes/prism-dark.css'

interface JsonValueProps {
  children: string | null
  disablePreview?: boolean
}

export const JsonValue = ({ children: value, disablePreview }: JsonValueProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const jsonPreviewPopoverRef = useRef<CustomPopoverRef>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    containerRef.current.innerHTML = value
      ? prism.highlight(value, prism.languages.json, 'json')
      : ''
  }, [value])

  return (
    <Stack direction="row" alignItems="center" gap={0}>
      <Box
        ref={containerRef}
        component="pre"
        sx={{
          m: 0,
          maxWidth: '12rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '0.875rem',
        }}
      />
      {!disablePreview && (
        <>
          <Tooltip title="Preview JSON">
            <Box>
              <IconButton
                size="small"
                color="inherit"
                onClick={(event) => jsonPreviewPopoverRef.current?.open(event.currentTarget)}
              >
                <OpenInFullRounded fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
          <CustomPopover
            ref={jsonPreviewPopoverRef}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            slotProps={{
              paper: {
                sx: {
                  display: 'flex',
                },
              },
            }}
          >
            <Preview value={value} />
          </CustomPopover>
        </>
      )}
    </Stack>
  )
}

const Preview = ({ value }: { value: string | null }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [parsingError, setParsingError] = useState(false)

  useEffect(() => {
    if (!previewContainerRef.current || !value) {
      return
    }

    const parsed = tryParseJSON(value)
    if (parsed) {
      setParsingError(false)
      previewContainerRef.current.innerHTML = prism.highlight(
        JSON.stringify(parsed, null, 2),
        prism.languages.json,
        'json',
      )
    } else {
      setParsingError(true)
    }
  }, [value])

  if (parsingError) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        p={2}
        sx={{ color: (theme) => theme.palette.error.main }}
      >
        <ErrorRounded />
        <Typography variant="body1" color="inherit" fontWeight="bold" lineHeight={1}>
          Invalid JSON
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack flexGrow={1} maxHeight="100%" overflow="auto">
      <Box
        ref={previewContainerRef}
        component="pre"
        sx={{
          m: 0,
          p: 2,
          overflow: 'auto',
          fontSize: '0.875rem',
        }}
      />
    </Stack>
  )
}
