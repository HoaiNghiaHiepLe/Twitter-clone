export function interpolateMessage(template: string, replacements: { [key: string]: string }): string {
  return Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(new RegExp(`:${key}`, 'g'), replacements[key])
  }, template)
}

export function defineProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K | string = 'message',
  propertyOptions: { [key: string]: any } = { enumerable: true }
): void {
  Object.getOwnPropertyNames(obj).forEach((propertyKey) => {
    if (propertyKey === key) {
      Object.defineProperty(obj, propertyKey, propertyOptions)
    }
  })
}
