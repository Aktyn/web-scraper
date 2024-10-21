import { forwardRef } from 'react'
import { SvgIcon, type SvgIconProps } from '@mui/material'

export const AktynLogoIcon = forwardRef<SVGSVGElement, SvgIconProps>((svgProps, forwardedRef) => (
  <SvgIcon {...svgProps} ref={forwardedRef}>
    <path d="M17.8764 22.3069L17.915 15.3908L23.83 11.9327L22.2793 11.032L17.915 13.5894L17.8764 8.56434L13.532 6.01854L17.9536 3.49447L17.9536 1.69305L11.9807 5.11748L6.04645 1.69305V3.49447L10.43 6.01819L6.1236 8.56434L6.10432 13.6223L1.72073 11.032L0.170035 11.9327L6.10432 15.4244L6.1236 22.3069L7.6743 21.4062L7.65501 16.3251L12 18.804L16.3637 16.2918L16.3257 21.4062L17.8764 22.3069ZM16.3635 14.4905L12.0014 17.0018L7.65501 14.5228L7.6743 9.46663L11.9815 6.91934L16.3243 9.46422L16.3635 14.4905Z" />
  </SvgIcon>
))