import AnimateCanvas from '@/components/canv/canvas'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import useTheme from '@/hooks/use-theme'

const LightDark: React.FC<{ theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void }> = ({ theme, setTheme }) => {
  return (
    <div className='cursor-pointer' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Moon /> : <Sun />}
    </div>
  )
}

const Github: React.FC = () => {
  return (
    <a href='https://github.com/harukiinharu/kanji' rel='noreferrer noopener' target='_blank' className='text-sm'>
      <svg role='img' viewBox='0 0 24 24' width={24} height={24}>
        <title>GitHub</title>
        <path
          fill='currentColor'
          d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
        />
      </svg>
    </a>
  )
}

const Footer: React.FC<{ theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void }> = ({ theme, setTheme }) => {
  return (
    <footer className='fixed bottom-0 z-5'>
      <div className='flex justify-between items-center w-screen px-4 pb-8'>
        <a href='https://youtu.be/0HYm60Mjm0k' rel='noreferrer noopener' target='_blank' className='text-sm' style={{ userSelect: 'none' }}>
          命に嫌われている - Iori Kanzaki
        </a>
        <div className='flex items-center gap-4'>
          <LightDark theme={theme} setTheme={setTheme} />
          <Github />
        </div>
      </div>
    </footer>
  )
}

const Home: React.FC = () => {
  const [isFullScreen, setFullScreen] = useState(false)
  const { theme, setTheme } = useTheme()

  // register keydown event listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't') {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [theme, setTheme])

  // register fullscreen event listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setFullScreen(document.fullscreenElement !== null)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  return (
    <>
      <AnimateCanvas theme={theme} isFullscreen={isFullScreen} />
      {!isFullScreen && <Footer theme={theme} setTheme={setTheme} />}
    </>
  )
}

export default Home
