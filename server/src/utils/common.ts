export const convertEnumToArray = (numberEnum: { [key: string]: string | number }, type: 'number' | 'string') => {
  return Object.values(numberEnum).filter((value) => {
    return typeof value === type
  })
}
export function normalizePath(path: string) {
  return path.replace(/\\/g, '/')
}
