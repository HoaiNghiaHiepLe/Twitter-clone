# Nội dung

## Chương 1: Cách học hiệu quả

-

## Chương 2: JS ôn tập

## Chương 3: Typescript cơ bản

## Chương 4: Git

## Chương 5: NodeJs cơ bản

- NodeJS là gì? Tại sao phải học NodeJs?
- Cài đặt NodeJs bằng NVM
- Javascript đơn luồng nhưng NodeJs đa luồng
- Module trong NodeJs

## Chương 6: NPM

- npm là gì?
- Cài, xóa, update package
- npx là gì?
- pnpm là gì?
- Lưu ý: Sau này làm cùng team, nếu team chọn npm hay pnpm thì làm theo, tự ý làm khác sẽ sinh ra file lock khác và có thể dẫn đến lỗi không đáng có.
- Tạo package và publish lên npm: Bài lab

## Chương 7: Tạo server với NodeJs

- Xử lý khi port xung đột

## Chương 8: Kỹ năng debug xử lý lỗi

- **Lỗi Typescript**: Lỗi liên quan đến kiểu dữ liệu không đúng, có thể bypass bằng any hoặc setting tsconfig
  - Bypass bằng `as any` hoặc `as Type...`
  - Bypass bằng thêm option `--transpileOnly` vào `ts-node` command
- **Lỗi ESLint**: Lỗi liên quan linter, có thể bypass bằng disable eslint
- **Lỗi Node.js**: Đây là lỗi nghiêm trọng liên quan đến code. Không nên bypass lỗi này mà phải xử lý

Cách debug

- Dùng Run and Debug VS Code
- Dùng chat gpt
- Console.log
- Search google

## Chương 9: MongoDB

- CSDL cơ bản
- SQL vs NoSQL
- MongoDB là gì?
- Cài đặt Mongo
- Mongo cơ bản
- Phân tích và thiết kế cơ sở dữ liệu
- Phân tích twitter theo Mongo

## Chương 10: Hệ thống authentication

- MVC Pattern
- Restful API
- Flow của authentication

## Chương : Chức năng user

## Chương: Xử lý media

1. folder `uploads` nên bỏ vào `.gitignore` vì đẩy lên git sẽ khá nặng
2. Để folder `uploads` trong máy tính local sẽ không thể share file với mọi người trong team được. => Giải pháp là upload lên 1 nền tảng như S3, hoặc upload lên server của chúng ta

## Chương : Chức năng tweet

## Chương : Chức năng search

## Chương : Gửi email với Amazon SES

## Chương: Socket.io

## Chương: Docker

## Chương: Deploy EC2

## Chưa implement

- Validate hashtag gửi lên: Yêu cầu là string không chứa dấu cách

```js
const generatePromise = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok')
    }, delay)
  })
}

async function main() {
  console.time('await từng cái')
  await generatePromise(3000)
  await generatePromise(3000)
  await generatePromise(3000)
  console.timeEnd('await từng cái')
}

main()

console.time('Promise.all')
Promise.all(
  [1, 2, 3].map(async (_) => {
    const result = await generatePromise(3000)
    return result
  })
).then((res) => {
  console.timeEnd('Promise.all')
})
```
