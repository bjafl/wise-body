import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type MouseEventHandler,
  type RefObject,
} from 'react'

const FlipButton: FC<
  React.ComponentProps<'button'> & {
    containerRef: RefObject<HTMLDivElement | null>
  }
> = ({ children, className, onClick, containerRef, ...btnProps }) => {
  const [flipped, setFlipped] = useState(false)
  const [btnTransform, setBtnTransform] = useState('rotateY(0deg) scale(1)')
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const cnHoverRemoved = useMemo(
    () => className?.replaceAll(/hover:[^\s]+/g, ''),
    [className]
  )

  useEffect(() => {
    if (flipped && btnRef.current && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect()
      const btn = btnRef.current.getBoundingClientRect()
      const scale = Math.min(container.width / btn.width, container.height / btn.height)
      const dx = container.left + container.width / 2 - (btn.left + btn.width / 2)
      setBtnTransform(`translate(${dx}px) rotateY(180deg) scale(${scale})`)
    } else {
      setBtnTransform('rotateY(0deg) scale(1)')
    }
  }, [flipped, containerRef])

  const handleContextMenu: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    setFlipped(true)
    e.preventDefault()
  }, [])

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (flipped) return
      onClick?.(e)
    },
    [flipped, onClick]
  )

  return (
    <div
      className="w-content h-content"
      style={{ perspective: '600px', zIndex: flipped ? 1000 : 1, display: 'inline-block' }}
    >
      <button
        ref={btnRef}
        onContextMenu={handleContextMenu}
        className={flipped ? cnHoverRemoved : className}
        onClick={handleClick}
        {...btnProps}
        style={{
          position: 'relative',
          transform: btnTransform,
          transition: 'transform 0.5s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {!flipped && children}
        <span
          style={{ transform: 'rotateY(180deg)', display: flipped ? 'inline-block' : 'none' }}
          onClick={() => setFlipped(false)}
        >
          Back
        </span>
      </button>
    </div>
  )
}

export default FlipButton
