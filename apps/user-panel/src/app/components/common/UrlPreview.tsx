import { forwardRef, useEffect, useRef, useState } from 'react'
import { OpenInFullRounded } from '@mui/icons-material'
import type { StackProps } from '@mui/material'
import {
  alpha,
  Backdrop,
  Box,
  CircularProgress,
  Fade,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { upsertSiteSchema } from '@web-scraper/common'
import { RootPortal } from './portal/RootPortal'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { useDebounce } from '../../hooks/useDebounce'
import { useStateToRef } from '../../hooks/useStateToRef'
import { errorLabels } from '../../utils'

interface UrlPreviewProps {
  url: string
  width: number
  maxHeight: number
}

export const UrlPreview = ({ url, width, maxHeight }: UrlPreviewProps) => {
  const cancellable = useCancellablePromise()
  const nextUrlToLoadRef = useRef('')

  const [imagePreviewSrc, setImagePreviewSrc] = useState('')
  const [loading, setLoading] = useState(false)
  const [maximizePreview, setMaximizePreview] = useState(false)

  const loadingRef = useStateToRef(loading)

  const loadPreviewDebounced = useDebounce(
    (url: string) => {
      if (loadingRef.current) {
        nextUrlToLoadRef.current = url
        return
      }

      setLoading(true)
      cancellable(window.electronAPI.getSitePreview(url))
        .then((response) => {
          if (nextUrlToLoadRef.current) {
            loadPreviewDebounced(nextUrlToLoadRef.current)
            nextUrlToLoadRef.current = ''
          }

          setLoading(false)
          if ('errorCode' in response) {
            console.warn(errorLabels[response.errorCode])
            setImagePreviewSrc('')
            return
          }
          setImagePreviewSrc('data:image/webp;base64,' + response.imageBase64)
        })
        .catch((error) => !error && setLoading(false))
    },
    1000,
    [cancellable],
  )

  useEffect(() => {
    try {
      setMaximizePreview(false)
      upsertSiteSchema.validateSyncAt('url', { url })
      loadPreviewDebounced(url)
    } catch {
      setImagePreviewSrc('')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    <>
      <Stack
        alignItems="stretch"
        justifyContent="flex-start"
        flexGrow={1}
        width={`${width}px`}
        minHeight="4rem"
        maxHeight={`${maxHeight}px`}
        position="relative"
        overflow="hidden"
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,

            maxHeight: '100%',
            minHeight: '4rem',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '1rem',
            overflow: 'auto',
            backgroundColor: alpha(common.black, 0.2),
          }}
        >
          {imagePreviewSrc ? (
            <Stack
              sx={{
                width: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <img alt="Site preview" src={imagePreviewSrc} width={width} />
            </Stack>
          ) : (
            !loading && (
              <AbsoluteOverlay>
                <Typography variant="body1" fontWeight={900} color="text.secondary">
                  Site Preview
                </Typography>
              </AbsoluteOverlay>
            )
          )}
        </Box>
        {imagePreviewSrc && (
          <AbsoluteOverlay
            alignItems="flex-end"
            justifyContent="flex-start"
            sx={{ pointerEvents: 'none' }}
          >
            <Box
              sx={{
                p: 1,
                borderBottomLeftRadius: '1rem',
                borderLeft: `1px solid ${alpha(common.black, 0.25)}`,
                borderBottom: `1px solid ${alpha(common.black, 0.25)}`,
                backgroundColor: alpha(common.black, 0.5),
              }}
            >
              <IconButton
                size="small"
                sx={{ pointerEvents: 'all' }}
                onClick={() => setMaximizePreview(true)}
              >
                <OpenInFullRounded />
              </IconButton>
            </Box>
          </AbsoluteOverlay>
        )}
        <Fade in={loading}>
          <AbsoluteOverlay justifyContent="flex-start" pt={2}>
            <CircularProgress color="primary" size="2rem" />
          </AbsoluteOverlay>
        </Fade>
      </Stack>
      {imagePreviewSrc && (
        <RootPortal>
          <Backdrop
            open={!!imagePreviewSrc && maximizePreview}
            onClick={() => setMaximizePreview(false)}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, overflowY: 'auto' }}
          >
            <Stack alignItems="center" width="100%" height="100%" px={2}>
              <img
                alt="Site preview"
                src={imagePreviewSrc}
                style={{ maxWidth: '100%', width: 'auto', height: 'auto' }}
              />
            </Stack>
          </Backdrop>
        </RootPortal>
      )}
    </>
  )
}

const AbsoluteOverlay = forwardRef<HTMLDivElement, StackProps>(
  ({ children, ...stackProps }, ref) => {
    return (
      <Stack
        ref={ref}
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
        position="absolute"
        left={0}
        top={0}
        {...stackProps}
      >
        {children}
      </Stack>
    )
  },
)
