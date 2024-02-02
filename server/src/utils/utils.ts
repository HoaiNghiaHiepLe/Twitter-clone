import { HtmlTemplateVariables } from '~/types/Template.type'

export function interpolateMessage(template: string, replacements: { [key: string]: string }): string {
  const templateKeys = template.match(/:[a-zA-Z0-9_]+/g) || []
  return templateKeys.reduce((acc, key) => {
    const cleanKey = key.substring(1) // Remove the ':' prefix
    const replacement = Object.prototype.hasOwnProperty.call(replacements, cleanKey) ? replacements[cleanKey] : ''
    return acc.replace(new RegExp(key, 'g'), replacement)
  }, template)
}

export function redefineObjectProperty<T extends object, K extends keyof T>(obj: T, key: K | string = 'message'): void {
  Object.getOwnPropertyNames(obj).forEach((propertyKey) => {
    // Vì một số Object lỗi không cho phép configurable và writable nên thay vì dùng Object.defineProperty để thay đổi thuộc tính của nó
    // thì ta tạo một object mới để chứa giá trị của key , gán giá trị của key đó vào object mới đó và return object mới về cho client
    // Tạo một object rỗng để chứa giá trị của key
    const finalError: any = {}
    // Nếu object không cho phép thay đổi thuộc tính hoặc không cho phép ghi đè thì return
    if (
      !Object.getOwnPropertyDescriptor(obj, key)?.configurable ||
      !Object.getOwnPropertyDescriptor(obj, key)?.writable
    ) {
      return
    }
    // Nếu key truyền vào bằng key của object thì gán giá trị của key đó vào finalError
    if (propertyKey === key) {
      // Gán giá trị của key vào finalError
      finalError[key] = obj[key as K]
    }
    return finalError
  })
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const replaceHtmlTemplateVariables = (template: string, variables: HtmlTemplateVariables): string =>
  // Chỉ thay thế các biến được tìm thấy cả trong mẫu và đối tượng biến được cung cấp.
  // Các biến không có trong mẫu vẫn giữ nguyên, và các biến thừa trong đối tượng được bỏ qua.
  template.replace(/{{(\w+)}}/g, (match, key) =>
    // Nếu biến được định nghĩa trong đối tượng, hãy thay thế nó; nếu không, hãy để giữ nguyên nơi đặt giữ chỗ.
    key in variables ? variables[key] : match
  )
