import { useEffect, useRef, useState, useCallback } from 'react'
import ShortcutsModal from '@/components/shortcuts'
import { fadeIn } from './animations'
import { Renderer, createCharRender, createCharTypingRender } from './renders'
import { context } from './meta'
import { getTimeIncreaseValue, getTimeValue } from './utils'
import s from '@/components/shortcuts.module.css'

type TimelineItem = {
  type: 'lyrics'
  time: number
  x: number
  y: number
  text: string
  fontSize?: number
  canceltime?: number
  animation?: 'none' | 'type'
}

const HDWidth = 1920
const HDHeight = 1080
const scale = 2

const timeline: TimelineItem[] = [
  { type: 'lyrics', time: 10.8, x: 1600, y: 120, text: '命に嫌われている。', fontSize: 80, animation: 'none' },
  { type: 'lyrics', time: 20.4, x: 1370, y: 40, text: '「死にたいなんて言うなよ。」' },
  { type: 'lyrics', time: 22.8, x: 1260, y: 250, text: '「諦めないで生きろよ。」' },
  { type: 'lyrics', time: 24.8, x: 1050, y: 160, text: 'そんな歌が正しいなんて馬鹿げてるよな。' },
  { type: 'lyrics', time: 29.2, x: 815, y: 85, text: '実際自分は死んでもよくて' },
  { type: 'lyrics', time: 32.0, x: 640, y: 460, text: '周りが死んだら悲しくて' },
  { type: 'lyrics', time: 34.54, x: 350, y: 80, text: '「それが嫌だから」っていう' },
  { type: 'lyrics', time: 37.0, x: 120, y: 650, text: 'エゴなんです。' },
  { type: 'lyrics', time: 39.7, x: 490, y: 400, text: '他人が生きてもどうでもよくて' },
  { type: 'lyrics', time: 42.0, x: 1150, y: 570, text: '誰かを嫌うこともファッションで' },
  { type: 'lyrics', time: 44.4, x: 935, y: 480, text: 'それでも「平和に生きよう」' },
  { type: 'lyrics', time: 46.0, x: 820, y: 810, text: 'なんて素敵なことでしょう。' },
  { type: 'lyrics', time: 49.2, x: 220, y: 900, text: '画面の先では誰かが死んで' },
  { type: 'lyrics', time: 51.6, x: 360, y: 1035, text: 'それを嘆いて誰かが歌って' },
  { type: 'lyrics', time: 54.0, x: 500, y: 1160, text: 'それに感化された少年が' },
  { type: 'lyrics', time: 56.4, x: 650, y: 1305, text: 'ナイフを持って走った。' },
  { type: 'lyrics', time: 58.19, x: 1400, y: 880, text: '僕らは命に嫌われている。', fontSize: 60 },
  { type: 'lyrics', time: 60.79, x: 1660, y: 1280, text: '価値観もエゴも押し付けて' },
  { type: 'lyrics', time: 62.9, x: 1020, y: 1420, text: 'いつも誰かを殺したい歌を' },
  { type: 'lyrics', time: 65.5, x: 840, y: 1540, text: '簡単に電波で流した。' },
  { type: 'lyrics', time: 67.76, x: 110, y: 1600, text: '僕らは命に嫌われている。' },
  { type: 'lyrics', time: 70.56, x: 270, y: 1780, text: '軽々しく死にたいだとか' },
  { type: 'lyrics', time: 72.9, x: 430, y: 1900, text: '軽々しく命を見てる僕らは' },
  { type: 'lyrics', time: 75.6, x: (1920 - 70) / 2, y: 2000, text: '命に嫌われている。', fontSize: 70 },
  { type: 'lyrics', time: 87.43, x: 1600, y: 2300, text: 'お金がないので今日も一日中惰眠を謳歌する。' },
  { type: 'lyrics', time: 92.25, x: 1360, y: 2400, text: '生きる意味なんて見出せず、無駄を自覚して息をする。' },
  { type: 'lyrics', time: 97.02, x: (1920 - 150) / 2, y: 2650, text: '「寂しい」', fontSize: 150 },
  { type: 'lyrics', time: 97.7, x: 720, y: 3200, text: 'なんて言葉で' },
  { type: 'lyrics', time: 99.3, x: 500, y: 2750, text: 'この傷が表せていいものか' },
  { type: 'lyrics', time: 101.9, x: 280, y: 2820, text: 'そんな意地ばかり抱え今日も一人ベッドに眠る' },
  { type: 'lyrics', time: 106.64, x: 1750, y: 3320, text: '少年だった僕たちは' },
  { type: 'lyrics', time: 108.64, x: 1540, y: 3370, text: 'いつか青年に変わっていく。' },
  { type: 'lyrics', time: 111.43, x: 1160, y: 3430, text: '年老いていつか枯れ葉のように' },
  { type: 'lyrics', time: 113.83, x: 1030, y: 3650, text: '誰にも知られず朽ちていく。' },
  { type: 'lyrics', time: 116.27, x: 650, y: 3670, text: '不死身の身体を手に入れて、' },
  { type: 'lyrics', time: 118.67, x: 450, y: 3870, text: '一生死なずに生きていく。' },
  { type: 'lyrics', time: 121.05, x: 190, y: 3990, text: 'そんなSFを妄想してる。' },
  { type: 'lyrics', time: 125.86, x: 1700, y: 4090, text: '自分が死んでもどうでもよくて' },
  { type: 'lyrics', time: 128.23, x: 1540, y: 4130, text: 'それでも周りに生きて欲しくて' },
  { type: 'lyrics', time: 130.65, x: 1360, y: 4200, text: '矛盾を抱えて生きてくなんて' },
  { type: 'lyrics', time: 132.95, x: 1250, y: 4380, text: '怒られてしまう。' },
  { type: 'lyrics', time: 135.42, x: 320, y: 4400, text: '「正しいものは正しくいなさい。」' },
  { type: 'lyrics', time: 137.82, x: 540, y: 4450, text: '「死にたくないなら生きていなさい。」' },
  { type: 'lyrics', time: 140.2, x: 780, y: 4600, text: '悲しくなるならそれでもいいなら' },
  { type: 'lyrics', time: 142.62, x: 1040, y: 4880, text: 'ずっと一人で笑えよ。' },
  { type: 'lyrics', time: 144.49, x: 1440, y: 4900, text: '僕らは命に嫌われている。' },
  { type: 'lyrics', time: 147.07, x: 1270, y: 5030, text: '幸福の意味すらわからず、' },
  { type: 'lyrics', time: 149.37, x: 660, y: 5230, text: '産まれた環境ばかり憎んで' },
  { type: 'lyrics', time: 151.94, x: 200, y: 5220, text: '簡単に過去ばかり呪う。' },
  { type: 'lyrics', time: 154.03, x: 440, y: 5370, text: '僕らは命に嫌われている。' },
  { type: 'lyrics', time: 156.72, x: 970, y: 5460, text: 'さよならばかりが好きすぎて' },
  { type: 'lyrics', time: 159.18, x: 1770, y: 5520, text: '本当の別れなど知らない僕らは' },
  { type: 'lyrics', time: 161.9, x: 1380, y: 5640, text: '命に嫌われている。', fontSize: 80 },
  { type: 'lyrics', time: 173.5, x: 1130, y: 6400, text: '幸福も' },
  { type: 'lyrics', time: 174.8, x: 1300, y: 6570, text: '別れも' },
  { type: 'lyrics', time: 176.1, x: 1000, y: 6670, text: '愛情も' },
  { type: 'lyrics', time: 177.4, x: 1200, y: 6840, text: '友情も' },
  { type: 'lyrics', time: 178.29, x: 800, y: 6440, text: '滑稽な夢の戯れで' },
  { type: 'lyrics', time: 180.69, x: 700, y: 6540, text: '全部カネで買える代物。' },
  { type: 'lyrics', time: 183.42, x: 1700, y: 6540, text: '明日、', fontSize: 150 },
  { type: 'lyrics', time: 183.82, x: 1550, y: 6300, text: '死んでしまうかもしれない。', fontSize: 80 },
  { type: 'lyrics', time: 185.84, x: 100, y: 6640, text: '全て、', fontSize: 150 },
  { type: 'lyrics', time: 186.24, x: 350, y: 6400, text: '無駄になるかもしれない。', fontSize: 80 },
  { type: 'lyrics', time: 188.14, x: 1070, y: 6860, text: '朝も' },
  { type: 'lyrics', time: 188.74, x: 1070, y: 7030, text: '夜も' },
  { type: 'lyrics', time: 189.34, x: 890, y: 7030, text: '春も' },
  { type: 'lyrics', time: 189.94, x: 890, y: 7200, text: '秋も' },
  { type: 'lyrics', time: 190.51, x: 990, y: 7000, text: '変わらず誰かがどこかで死ぬ。' },
  { type: 'lyrics', time: 192.9, x: 1400, y: 7000, text: '夢も明日も何もいらない。' },
  { type: 'lyrics', time: 195.18, x: 1300, y: 7140, text: '君が生きていたならそれでいい。' },
  { type: 'lyrics', time: 197.6, x: 1180, y: 7390, text: 'そうだ。' },
  { type: 'lyrics', time: 198.86, x: 1080, y: 7490, text: '本当は' },
  { type: 'lyrics', time: 200.2, x: 680, y: 7350, text: 'そういうことが歌いたい。' },
  { type: 'lyrics', time: 202.66, x: 1680, y: 7600, text: '命に嫌われている。' },
  { type: 'lyrics', time: 204.71, x: 1560, y: 7650, text: '結局いつかは死んでいく。' },
  { type: 'lyrics', time: 207.18, x: 1440, y: 7920, text: '君だって' },
  { type: 'lyrics', time: 208.18, x: 1320, y: 8020, text: '僕だって' },
  { type: 'lyrics', time: 209.18, x: 520, y: 7640, text: 'いつかは枯れ葉のように朽ちてく。' },
  { type: 'lyrics', time: 211.63, x: 1120, y: 7720, text: 'それでも僕らは必死に生きて', fontSize: 50 },
  { type: 'lyrics', time: 214.25, x: 790, y: 7750, text: '命を必死に抱えて生きて', fontSize: 50 },
  { type: 'lyrics', time: 216.71, x: 1690, y: 8050, text: '殺して', fontSize: 120 },
  { type: 'lyrics', time: 217.31, x: 1460, y: 8170, text: 'あがいて', fontSize: 120 },
  { type: 'lyrics', time: 217.91, x: 190, y: 8100, text: '笑って', fontSize: 120 },
  { type: 'lyrics', time: 218.51, x: 620, y: 8250, text: '抱えて', fontSize: 120 },
  { type: 'lyrics', time: 219.11, x: 920, y: 7850, text: '生きて、', fontSize: 120 },
  { type: 'lyrics', time: 219.71, x: 920, y: 8350, text: '生きて、', fontSize: 120, canceltime: 221.51 },
  { type: 'lyrics', time: 220.31, x: 350, y: 8300, text: '生きて、', fontSize: 120 },
  { type: 'lyrics', time: 220.91, x: 1230, y: 8300, text: '生きて、', fontSize: 120 },
  { type: 'lyrics', time: 221.51, x: 920, y: 8350, text: '生きろ。', fontSize: 120 },
  { type: 'lyrics', time: 241.1, x: 1285, y: 9050, text: '命に嫌われている。' },
  { type: 'lyrics', time: 243.5, x: 635, y: 9250, text: 'カンザキイオリ' },
]

const chars = [...new Set(timeline.map((item) => item.text).join(''))].join('').split('')

const PlayPause: React.FC = () => {
  return (
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
    >
      <polygon points='6 3 20 12 6 21 6 3' />
    </svg>
  )
}

const Control: React.FC<{ audio: HTMLAudioElement; isFullscreen: boolean; theme: 'light' | 'dark' }> = ({ audio, isFullscreen, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [pause, setPause] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const isDown = useRef(false)
  const [mouseMoveTime, setMouseMoveTime] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  // register mouse move event listener
  useEffect(() => {
    // show mouse when mouse move
    const onMouseMove = () => {
      document.body.style.cursor = 'auto'
      setShowProgress(true)
      setMouseMoveTime(Date.now())
    }
    const interval = setInterval(() => {
      // check if mouse is not moving
      if (Date.now() - mouseMoveTime > 1000 && isFullscreen) {
        document.body.style.cursor = 'none'
        setShowProgress(false)
      }
    }, 1000)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      clearInterval(interval)
    }
  }, [mouseMoveTime])

  useEffect(() => {
    const hash = window.location.hash
    const hashParts = hash.split('?')
    if (hashParts.length > 1) {
      const searchParams = new URLSearchParams(hashParts[1])
      const t = searchParams.get('t')
      if (t) {
        audio.currentTime = parseFloat(t)
        setTime(audio.currentTime)
      }
    }
  }, [audio])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        setShowShortcuts(prev => !prev)
      }
    }
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

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return
      setTimeFromX(e.clientX)
      e.stopPropagation()
      e.preventDefault()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDown.current || e.targetTouches.length === 0) return
      setTimeFromX(e.targetTouches.item(0)!.clientX)
      e.stopPropagation()
      e.preventDefault()
    }

    const onEnd = (e: Event) => {
      if (!isDown.current) return
      isDown.current = false
      audio.play()
      e.stopPropagation()
      e.preventDefault()
    }

    audio.addEventListener('play', onUpdateState)
    audio.addEventListener('pause', onUpdateState)
    audio.addEventListener('timeupdate', onTimeUpdate)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchend', onEnd)
    window.addEventListener('mouseup', onEnd)

    return () => {
      audio.removeEventListener('play', onUpdateState)
      audio.removeEventListener('pause', onUpdateState)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('mouseup', onEnd)
    }
  }, [audio])

  const setTimeFromX = useCallback(
    (x: number) => {
      if (!containerRef.current) return
      const bounding = containerRef.current.getBoundingClientRect()
      const percent = (x - bounding.left) / bounding.width

      audio.currentTime = Math.round(percent * audio.duration)
    },
    [audio]
  )

  return (
    <>
      <div className='fixed inset-0 flex pointer-events-none select-none'>
        {showShortcuts ? (
          <div className={`m-auto w-sm ${theme === 'dark' ? 'bg-[#171717]' : 'bg-[#f5f5f5]'} rounded-md p-8`}>
            <ShortcutsModal />
          </div>
        ) : (
          <div className='m-auto'>
            {pause ? (
              time === 0 ? (
                <div className='text-center'>
                  <p>
                    Press <span className={s.key}>D</span> to display shortcuts
                  </p>
                </div>
              ) : (
                <PlayPause />
              )
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
      {(!isFullscreen || showProgress) && (
        <div
          ref={containerRef}
          className='fixed w-full z-10 cursor-pointer'
          onTouchStart={e => {
            if (e.targetTouches.length === 0) return
            isDown.current = true
            audio.pause()
            setTimeFromX(e.targetTouches.item(0)!.clientX)
          }}
          onMouseDown={e => {
            isDown.current = true
            audio.pause()
            setTimeFromX(e.clientX)
          }}
        >
          <div
            className={`fixed h-4 bottom-0 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
            style={{
              width: `${(time / audio.duration) * 100}%`,
            }}
          ></div>
          <span
            className={`fixed bottom-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            style={{
              left: `${(time / audio.duration) * 100}%`,
              transform: 'translateX(-50%)',
              userSelect: 'none',
            }}
          >
            命
          </span>
        </div>
      )}
    </>
  )
}

const AnimateCanvas: React.FC<{ theme: 'light' | 'dark'; isFullscreen: boolean }> = ({ theme, isFullscreen }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [ready, setReady] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const getRenderObjects = (ctx: CanvasRenderingContext2D, audio: HTMLAudioElement, theme: 'light' | 'dark') => {
    const fontFamily = getComputedStyle(document.body).fontFamily
    let objects: Renderer[] = []
    let currentIndex = 0

    // console.log(window.innerWidth, window.innerHeight)
    if (!audio) return objects
    const timestamp = audio.currentTime

    context.ctx = ctx
    context.vertical = true
    context.time = timestamp

    while (currentIndex < timeline.length && context.time > timeline[currentIndex].time) {
      const item = timeline[currentIndex]

      if (timestamp > item.canceltime) {
        currentIndex++
        continue
      }

      if (item.type === 'lyrics') {
        for (let i = 0; i < item.text.length; i++) {
          const fontSize = item.fontSize ?? 38
          let renderer: Renderer

          if (item.animation === 'none') {
            renderer = createCharRender(item.text.charAt(i), item.x * scale, (i * (fontSize + 8) + item.y) * scale, {
              animation: fadeIn(item.time - context.time, 0, theme),
              font: `${fontSize * scale}px ${fontFamily}`,
            })
          } else {
            const relativeDelay = i * 0.15 + item.time - context.time

            renderer = createCharTypingRender(item.text.charAt(i), item.x * scale, (i * (fontSize + 8) + item.y) * scale, {
              animation: fadeIn(relativeDelay, 0.1, theme),
              font: `${fontSize * scale}px ${fontFamily}`,
              delay: relativeDelay,
              duration: 0.15,
              chars: chars.slice(Math.round(Math.random() * (chars.length - 5))),
            })
          }

          objects.push(renderer)
        }
      }

      currentIndex++
    }

    // global settings
    // const alpha = 1 - getTimeValue(audio.duration - 22, audio.duration, 1)
    const yOffset = getTimeIncreaseValue(39.65, audio.duration, -43 * scale)

    // ctx.globalAlpha = alpha
    ctx.translate(0, yOffset)

    return objects
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return
      const canvas = ref.current
      const container = canvas.parentElement!
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Calculate dimensions while maintaining aspect ratio
      const aspectRatio = HDWidth / HDHeight
      let width = containerWidth
      let height = containerWidth / aspectRatio

      if (height > containerHeight) {
        height = containerHeight
        width = containerHeight * aspectRatio
      }

      setDimensions({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // register keydown event listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        // play/pause
        const audio = audioRef.current!
        if (audio.paused) {
          audio.play()
        } else {
          audio.pause()
          const hashParts = window.location.hash.split('?')
          const t = String(audio.currentTime).split('.')
          window.history.pushState({}, '', `${hashParts[0]}?t=${t[0]}.${t[1].slice(0, 3)}`)
        }
      } else if (e.key === 'f') {
        // full screen
        if (isFullscreen) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
      } else if (e.key === 'ArrowLeft') {
        // backward 5s
        const audio = audioRef.current!
        audio.currentTime -= 5
        const hashParts = window.location.hash.split('?')
        const t = String(audio.currentTime).split('.')
        window.history.pushState({}, '', `${hashParts[0]}?t=${t[0]}.${t[1].slice(0, 3)}`)
      } else if (e.key === 'ArrowRight') {
        // forward 5s
        const audio = audioRef.current!
        audio.currentTime += 5
        const hashParts = window.location.hash.split('?')
        const t = String(audio.currentTime).split('.')
        window.history.pushState({}, '', `${hashParts[0]}?t=${t[0]}.${t[1].slice(0, 3)}`)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isFullscreen])

  // register canvas event listener
  useEffect(() => {
    if (!ref.current) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')!
    let mounted = true

    if (!audioRef.current) {
      const audio = (audioRef.current = new Audio('./inochi.mp3'))
      audio.load()
      audio.volume = 0.5
      audio.addEventListener('loadeddata', () => {
        setReady(audio.readyState >= 3)
      })
    }

    const init = () => {
      canvas.width = HDWidth * scale
      canvas.height = HDHeight * scale
    }

    const loop = () => {
      if (!mounted) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      init()

      const objects = getRenderObjects(ctx, audioRef.current, theme)
      for (const object of objects) {
        object.render()
      }

      requestAnimationFrame(loop)
    }

    loop()
    return () => {
      mounted = false
    }
  }, [timeline, theme])

  return (
    <main>
      <div
        className='fixed inset-0 flex flex-col items-center'
        onClick={() => {
          if (!ready) return
          const audio = audioRef.current!
          if (audio.paused) {
            audio.play()
          } else {
            audio.pause()
            const hashParts = window.location.hash.split('?')
            const t = String(audio.currentTime).split('.')
            window.history.pushState({}, '', `${hashParts[0]}?t=${t[0]}.${t[1].slice(0, 3)}`)
          }
        }}
      >
        <canvas
          ref={ref}
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
          }}
        />
      </div>
      {ready && <Control audio={audioRef.current!} isFullscreen={isFullscreen} theme={theme} />}
    </main>
  )
}

export default AnimateCanvas
