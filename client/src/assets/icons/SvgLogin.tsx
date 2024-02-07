import { SvgType } from 'src/types/Svg.type'

const SvgLogin = ({ className }: SvgType) => {
  return (
    <svg
      className={className}
      stroke='#1F4878'
      fill='#1F4878'
      strokeWidth={2}
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      width='22'
      height='18'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
      <polyline points='10 17 15 12 10 7' />
      <line x1={15} x2={3} y1={12} y2={12} />
    </svg>
  )
}

export default SvgLogin
