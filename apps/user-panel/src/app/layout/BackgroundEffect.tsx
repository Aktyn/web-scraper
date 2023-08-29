import { memo, useEffect, useRef } from 'react'
import { darken, decomposeColor, useTheme } from '@mui/material'
import { gaussianRandomRange, random } from '@web-scraper/common'
import { AutoSizer } from '../components/common/AutoSizer'
import { Config } from '../config'
import { useDebounce } from '../hooks/useDebounce'
import { useView } from '../hooks/useView'

const EPSILON = 1e-4

export const BackgroundEffect = () => (
  <AutoSizer absolute>{(size) => <AbstractBackgroundRenderer {...size} />}</AutoSizer>
)

interface AbstractBackgroundRendererProps {
  width: number
  height: number
}

const AbstractBackgroundRenderer = memo<AbstractBackgroundRendererProps>(
  ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const backgroundRef = useRef(new AbstractBackground())
    const theme = useTheme()
    const view = useView()

    const backgroundColor = theme.palette.background.default

    useEffect(() => {
      const canvas = canvasRef.current
      const ctx: CanvasRenderingContext2D | null | undefined = canvasRef.current?.getContext('2d', {
        alpha: true,
      })
      if (canvas && ctx) {
        backgroundRef.current.onResize(canvas.width, canvas.height, ctx)
      }

      const colorValues = decomposeColor(darken(backgroundColor, 0.05)).values
      backgroundRef.current.setColor([colorValues[0], colorValues[1], colorValues[2]])
    }, [backgroundColor])

    const onResizeDebounced = useDebounce(
      (width: number, height: number, ctx: CanvasRenderingContext2D) => {
        backgroundRef.current.onResize(width, height, ctx)
      },
      200,
      [],
    )

    useEffect(() => {
      const ctx: CanvasRenderingContext2D | null | undefined = canvasRef.current?.getContext('2d', {
        alpha: true,
      })

      if (!ctx) {
        return
      }

      onResizeDebounced(width, height, ctx)
    }, [height, onResizeDebounced, width])

    useEffect(() => {
      backgroundRef.current.rearrange()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view.viewName])

    return <canvas ref={canvasRef} width={width} height={height} />
  },
  (prev, next) => prev.width === next.width && prev.height === next.height,
)

type ColorValues = [number, number, number]

class AbstractBackground {
  /** Milliseconds */
  private static readonly colorTransitionDuration = Config.VIEW_TRANSITION_DURATION / 2
  /** Pixels */
  public static readonly particleSizeBase = 24
  private static readonly particlesPerPixel = 0.03 / this.particleSizeBase ** 2

  private width = 0
  private height = 0
  private ctx: CanvasRenderingContext2D | null = null
  private color: ColorValues
  private intermediateColor: ColorValues
  private nextColor: ColorValues

  private animationFrameId: number | null = null
  private prev = 0
  private updateEvent = this.update.bind(this)

  private particles: Particle[] = []

  constructor(color: ColorValues = [0, 0, 0]) {
    this.color = this.nextColor = [...color]
    this.intermediateColor = [...color]
  }

  public onResize(width: number, height: number, ctx: CanvasRenderingContext2D) {
    this.width = width
    this.height = height
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = true

    for (const particle of this.particles) {
      particle.setAreaSize(width, height)
    }
    this.registerChange()
  }

  public setColor(color: ColorValues) {
    this.nextColor = color
    this.registerChange()
  }

  public rearrange() {
    for (const particle of this.particles) {
      particle.randomizePosition()
    }
    this.registerChange()
  }

  private fillRegularPolygon(centerX: number, centerY: number, outerRadius: number, sides: number) {
    if (!this.ctx) {
      return
    }

    this.ctx.beginPath()

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides

      const x = centerX + outerRadius * Math.cos(angle)
      const y = centerY + outerRadius * Math.sin(angle)

      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y)
    }

    this.ctx.closePath()
    this.ctx.fill()
  }

  private draw() {
    if (!this.ctx) {
      return
    }
    this.ctx.fillStyle = `rgba(${this.intermediateColor.join(',')})`
    this.ctx.clearRect(0, 0, this.width, this.height)

    for (const particle of this.particles) {
      const [x, y] = particle.position
      const size = particle.size

      this.ctx.save()
      this.ctx.translate(x, y)
      this.ctx.rotate(particle.rotation)

      this.fillRegularPolygon(0, 0, size / 2, particle.sides)

      this.ctx.restore()
    }
  }

  private registerChange() {
    if (this.animationFrameId !== null) {
      return
    }
    this.prev = 0
    this.animationFrameId = requestAnimationFrame(this.updateEvent)
  }

  private update(time: number) {
    const delta = time - this.prev
    this.prev = time

    if (delta > 1000) {
      this.animationFrameId = requestAnimationFrame(this.updateEvent)
      return
    }

    const particlesUpdates = this.updateParticles(delta)
    const colorUpdated = this.transitionColor(delta)

    this.draw()

    if (colorUpdated || particlesUpdates) {
      this.animationFrameId = requestAnimationFrame(this.updateEvent)
    } else {
      this.animationFrameId = null
    }
  }

  private transitionColor(delta: number) {
    if (this.color === this.nextColor) {
      return false
    }

    let updated = false

    for (let i = 0; i < this.color.length; i++) {
      if (this.intermediateColor[i] === this.nextColor[i]) {
        continue
      }

      const step =
        (this.nextColor[i] - this.color[i]) *
        Math.max(EPSILON, Math.min(1, delta / AbstractBackground.colorTransitionDuration))
      const stepSign = Math.sign(step)

      this.intermediateColor[i] += step

      const afterSign = Math.sign(this.nextColor[i] - this.intermediateColor[i])

      if (stepSign !== afterSign) {
        this.intermediateColor[i] = this.nextColor[i]
      } else {
        updated = true
      }
    }

    if (!updated) {
      this.color = this.nextColor
    }

    return updated
  }

  private updateParticles(delta: number) {
    const area = this.width * this.height
    const targetParticlesCount = Math.round(area * AbstractBackground.particlesPerPixel)

    let updated = false

    while (this.particles.length > targetParticlesCount) {
      this.particles.pop()
    }
    while (this.particles.length < targetParticlesCount) {
      this.particles.push(new Particle(this.width, this.height))
    }

    for (const particle of this.particles) {
      if (particle.update(delta)) {
        updated = true
      }
    }

    return updated
  }
}

class Particle {
  private static readonly movementSpeed = 2

  private pos: [number, number] = [0, 0]
  private nextPos: [number, number] = [0, 0]
  public readonly sides = 3 + (Math.abs(gaussianRandomRange(-4, 4, 4)) | 0)
  public readonly size =
    AbstractBackground.particleSizeBase +
    random(-AbstractBackground.particleSizeBase * 0.5, AbstractBackground.particleSizeBase * 0.5)
  public readonly rotation = Math.PI * Math.random()

  constructor(
    private width: number,
    private height: number,
  ) {
    this.randomizePosition(true)
  }

  get position() {
    return this.pos
  }

  public setAreaSize(width: number, height: number) {
    this.width = width
    this.height = height
    this.randomizePosition()
  }

  public randomizePosition(init = false) {
    if (init) {
      this.nextPos = [Math.random() * this.width, Math.random() * this.height]
      this.pos = [...this.nextPos]
    } else {
      const movementFactor = 0.2
      this.nextPos[0] = Math.min(
        this.width,
        Math.max(
          0,
          this.nextPos[0] + random(-this.width * movementFactor, this.width * movementFactor),
        ),
      )
      this.nextPos[1] = Math.min(
        this.height,
        Math.max(
          0,
          this.nextPos[1] + random(-this.height * movementFactor, this.height * movementFactor),
        ),
      )
    }
  }

  public update(delta: number) {
    let updated = false
    for (let i = 0; i < this.pos.length; i++) {
      const step =
        (this.nextPos[i] - this.pos[i]) *
        Math.max(EPSILON, Math.min(1, (delta / 1000) * Particle.movementSpeed))

      if (Math.abs(step) >= 0.1) {
        this.pos[i] += step
        updated = true
      } else {
        this.pos[i] = this.nextPos[i]
      }
    }
    return updated
  }
}
