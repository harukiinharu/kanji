import { useEffect, useRef, useState } from 'react'
import { fadeIn } from './animations'
import { Renderer, createCharRender, createCharTypingRender } from './renders'
import { context } from './meta'
import { getTimeIncreaseValue, getTimeValue } from './utils'
import ShortcutsModal from '@/components/shortcuts'

type TimelineItem = {
  type: 'lyrics'
  time: number
  x: number
  y: number
  fontSize?: number
  text: string
  animation?: 'none' | 'type'
}

const HDWidth = 1920
const HDHeight = 1080
const scale = 2

const timeline: TimelineItem[] = [
  { type: 'lyrics', time: 10.8, x: 1760, y: 120, text: '命に嫌われている。', fontSize: 80, animation: 'none' },
  { type: 'lyrics', time: 20.4, x: 80, y: 120, text: '「死にたいなんて言うなよ。」' },
  { type: 'lyrics', time: 22.8, x: 200, y: 200, text: '「諦めないで生きろよ。」' },
  { type: 'lyrics', time: 24.8, x: 400, y: 160, text: 'そんな歌が正しいなんて馬鹿げてるよな。' },
  { type: 'lyrics', time: 29.2, x: 280, y: 240, text: '実際自分は死んでもよくて' },
  { type: 'lyrics', time: 32.0, x: 600, y: 360, text: '周りが死んだら悲しくて' },
  { type: 'lyrics', time: 34.54, x: 720, y: 200, text: '「それが嫌だから」っていう' },
  { type: 'lyrics', time: 37.0, x: 800, y: 300, text: 'エゴなんです。' },
  { type: 'lyrics', time: 39.7, x: 1000, y: 200, text: '他人が生きてもどうでもよくて' },
  { type: 'lyrics', time: 42.0, x: 1200, y: 400, text: '誰かを嫌うこともファッションで' },
  { type: 'lyrics', time: 44.4, x: 1280, y: 420, text: 'それでも「平和に生きよう」' },
  { type: 'lyrics', time: 46.3, x: 1400, y: 540, text: 'なんて素敵なことでしょう。' },
  { type: 'lyrics', time: 49.2, x: 1500, y: 640, text: '画面の先では誰かが死んで' },
  { type: 'lyrics', time: 51.6, x: 100, y: 880, text: 'それを嘆いて誰かが歌って' },
  { type: 'lyrics', time: 54.0, x: 200, y: 900, text: 'それに感化された少年が' },
  { type: 'lyrics', time: 56.4, x: 340, y: 980, text: 'ナイフを持って走った。' },
  { type: 'lyrics', time: 58.19, x: 500, y: 1080, text: '僕らは命に嫌われている。' },
  { type: 'lyrics', time: 60.79, x: 700, y: 1120, text: '価値観もエゴも押し付けて' },
  { type: 'lyrics', time: 62.9, x: 1200, y: 1200, text: 'いつも誰かを殺したい歌を' },
  { type: 'lyrics', time: 65.5, x: 1320, y: 1300, text: '簡単に電波で流した。' },
  { type: 'lyrics', time: 67.76, x: 1580, y: 1400, text: '僕らは命に嫌われている。' },
  { type: 'lyrics', time: 70.56, x: 240, y: 1500, text: '軽々しく死にたいだとか' },
  { type: 'lyrics', time: 72.9, x: 380, y: 1560, text: '軽々しく命を見てる僕らは' },
  { type: 'lyrics', time: 75.6, x: 920, y: 1800, fontSize: 80, text: '命に嫌われている。' },
]

type Script = (ctx: CanvasRenderingContext2D, audio: HTMLAudioElement | null | undefined) => Renderer[]

const chars =
  '点フツホ問両今クユセエ何集コト求車こぴ聞東成ひそのな祝質正案ぽけっ右土ぜち月返っせゅ拡首つ斐程やぼ治能こめご彦退'.split(
    ''
  )

const createScript = (): Script => {
  const fontFamily = getComputedStyle(document.body).fontFamily
  let objects: Renderer[] = []
  let currentIndex = 0

  return (ctx, audio) => {
    if (!audio) return objects
    const timestamp = audio.currentTime

    context.ctx = ctx
    context.vertical = true
    context.time = timestamp

    while (currentIndex < timeline.length && timestamp > timeline[currentIndex].time) {
      const item = timeline[currentIndex]
      if (item.type === 'lyrics') {
        for (let i = 0; i < item.text.length; i++) {
          const fontSize = item.fontSize ?? 38
          let renderer: Renderer

          if (item.animation === 'none') {
            renderer = createCharRender(item.text.charAt(i), item.x * scale, (i * (fontSize + 8) + item.y) * scale, {
              animation: fadeIn(item.time - context.time, 0),
              font: `${fontSize * scale}px ${fontFamily}`,
            })
          } else {
            const relativeDelay = i * 0.1 + item.time - context.time

            renderer = createCharTypingRender(
              item.text.charAt(i),
              item.x * scale,
              (i * (fontSize + 8) + item.y) * scale,
              {
                animation: fadeIn(relativeDelay, 0.1),
                font: `${fontSize * scale}px ${fontFamily}`,
                delay: relativeDelay,
                duration: 0.1,
                chars: chars.slice(Math.round(Math.random() * (chars.length - 5))),
              }
            )
          }

          objects.push(renderer)
        }
      }

      currentIndex++
    }

    // global settings
    const alpha = 1 - getTimeValue(audio.duration - 5, audio.duration, 1)
    const yOffset = getTimeIncreaseValue(39, audio.duration, -40 * scale)

    ctx.globalAlpha = alpha
    ctx.translate(0, yOffset)

    return objects
  }
}

const AnimateCanvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>()
  const [ready, setReady] = useState(false)
  const [mouseMoveTimestamp, setMouseMoveTimestamp] = useState(0)

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      // play/pause
      const audio = audioRef.current!
      audio.paused ? audio.play() : audio.pause()
    } else if (e.key === 'f') {
      // full screen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    } else if (e.key === 'ArrowLeft') {
      // backward 5s
      const audio = audioRef.current!
      audio.currentTime -= 5
    } else if (e.key === 'ArrowRight') {
      // forward 5s
      const audio = audioRef.current!
      audio.currentTime += 5
    }
  }

  useEffect(() => {
    // show mouse when mouse move
    const onMouseMove = () => {
      document.body.style.cursor = 'auto'
      setMouseMoveTimestamp(Date.now())
    }
    const interval = setInterval(() => {
      // check if mouse is not moving
      if (Date.now() - mouseMoveTimestamp > 1000 && document.fullscreenElement !== null) {
        document.body.style.cursor = 'none'
      }
    }, 1000)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      clearInterval(interval)
    }
  }, [mouseMoveTimestamp])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')!
    let mounted = true
    const script = createScript()

    if (!audioRef.current) {
      const audio = (audioRef.current = new Audio('/audio-short.mp3'))
      audio.load()
      audio.volume = 0.8
      audio.addEventListener('loadeddata', () => {
        setReady(audio.readyState >= 3)
      })
    }

    const init = () => {
      canvas.width = HDWidth * scale
      canvas.height = HDHeight * scale
      ctx.strokeStyle = ctx.fillStyle = 'white'
    }

    const loop = () => {
      if (!mounted) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      init()

      const objects = script(ctx, audioRef.current)
      for (const object of objects) {
        object.render()
      }

      requestAnimationFrame(loop)
    }

    loop()
    return () => {
      mounted = false
    }
  }, [timeline])

  return (
    <main>
      <div className='fixed inset-0 flex flex-col'>
        <canvas ref={ref} className='aspect-video max-w-full max-h-full' />
      </div>
      {ready && <Control audio={audioRef.current!} />}
    </main>
  )
}

const Control: React.FC<{ audio: HTMLAudioElement }> = ({ audio }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [pause, setPause] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(true)

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'd') {
      setShowShortcuts(prev => !prev)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    const onUpdateState = () => {
      setPause(audio.paused)
    }

    const onTimeUpdate = () => {
      setTime(audio.currentTime)
    }

    // const onMouseMove = (e: MouseEvent) => {
    //   if (!isDown.current) return
    //   setTimeFromX(e.clientX)
    //   e.stopPropagation()
    //   e.preventDefault()
    // }

    // const onTouchMove = (e: TouchEvent) => {
    //   if (!isDown.current || e.targetTouches.length === 0) return
    //   setTimeFromX(e.targetTouches.item(0)!.clientX)
    //   e.stopPropagation()
    //   e.preventDefault()
    // }

    // const onEnd = (e: Event) => {
    //   if (!isDown.current) return
    //   isDown.current = false
    //   audio.play()
    //   e.stopPropagation()
    //   e.preventDefault()
    // }

    audio.addEventListener('play', onUpdateState)
    audio.addEventListener('pause', onUpdateState)
    audio.addEventListener('timeupdate', onTimeUpdate)
    // window.addEventListener('touchmove', onTouchMove)
    // window.addEventListener('mousemove', onMouseMove)
    // window.addEventListener('touchend', onEnd)
    // window.addEventListener('mouseup', onEnd)

    return () => {
      audio.removeEventListener('play', onUpdateState)
      audio.removeEventListener('pause', onUpdateState)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      // window.removeEventListener('touchmove', onTouchMove)
      // window.removeEventListener('mousemove', onMouseMove)
      // window.removeEventListener('touchend', onEnd)
      // window.removeEventListener('mouseup', onEnd)
    }
  }, [audio])

  // const setTimeFromX = useCallback(
  //   (x: number) => {
  //     if (!containerRef.current) return
  //     const bounding = containerRef.current.getBoundingClientRect()
  //     const percent = (x - bounding.left) / bounding.width

  //     audio.currentTime = Math.round(percent * audio.duration)
  //   },
  //   [audio]
  // )

  return (
    <>
      <div className='fixed inset-0 flex pointer-events-none select-none'>
        {showShortcuts ? (
          <div className='m-auto w-sm bg-[#171717] rounded-md p-8'>
            <ShortcutsModal />
          </div>
        ) : pause ? (
          <div className='m-auto'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='120'
              height='120'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              // strokeLinecap='round'
              // strokeLinejoin='round'
              className='opacity-40'
            >
              <polygon points='6 3 20 12 6 21 6 3' />
            </svg>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div
        ref={containerRef}
        className={`fixed w-full h-1 bottom-0 overflow-hidden opacity-40 ${
          document.fullscreenElement !== null ? 'hidden' : ''
        }`}
        // onTouchStart={e => {
        //   if (e.targetTouches.length === 0) return
        //   isDown.current = true
        //   audio.pause()
        //   setTimeFromX(e.targetTouches.item(0)!.clientX)
        // }}
        // onMouseDown={e => {
        //   isDown.current = true
        //   audio.pause()
        //   setTimeFromX(e.clientX)
        // }}
      >
        <div
          className='bg-white h-full'
          style={{
            width: `${(time / audio.duration) * 100}%`,
          }}
        />
      </div>
    </>
  )
}

export default AnimateCanvas
