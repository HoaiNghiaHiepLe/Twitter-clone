export function interpolateMessage(template: string, replacements: { [key: string]: string }): string {
  return Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(new RegExp(`:${key}`, 'g'), replacements[key])
  }, template)
}
