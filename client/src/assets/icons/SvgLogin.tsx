import { SvgType } from 'src/types/Svg.type'

const SvgLogin = ({ className }: SvgType) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      width='22'
      height='18'
      viewBox='0 0 22 18'
      fill='none'
    >
      <path
        d='M10.5 0L9.5 2.5H19.5V15H10.5L9.5 17.5H22V0H10.5ZM10 5V7.5H1L0 10H10V12.5L15 8.75L10 5Z'
        fill='#1F4878'
      />
    </svg>
  )
}

export default SvgLogin
