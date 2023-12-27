export function interpolateMessage(template: string, replacements: { [key: string]: string }): string {
  const templateKeys = template.match(/:[a-zA-Z0-9_]+/g) || []
  return templateKeys.reduce((acc, key) => {
    const cleanKey = key.substring(1) // Remove the ':' prefix
    const replacement = Object.prototype.hasOwnProperty.call(replacements, cleanKey) ? replacements[cleanKey] : ''
    return acc.replace(new RegExp(key, 'g'), replacement)
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

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
