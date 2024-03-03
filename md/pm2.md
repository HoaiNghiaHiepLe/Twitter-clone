### Use NODE_ENV

Chúng ta chỉ cần truyền `NODE_ENV=production` vào trước câu lệnh `node index.js` là được.

Ví dụ:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  }
}
```

Và chúng ta có thể nhận giá trị của `NODE_ENV` bằng cách `process.env.NODE_ENV`.

> Nếu bạn cần nhiều tham số hơn thì dùng `minimist`, còn ở đây chúng ta chỉ cần quy định môi trường thôi thì NODE_ENV là đủ rồi.

## Giới thiệu về PM2

PM2 giúp quản lý các tiến trình NodeJs một cách hiệu quả và dễ dàng, bằng cách cung cấp một số tính năng như:

- Khởi động lại lại ứng dụng khi ứng dụng crash
- Tự động khởi động lại ứng dụng khi server khởi động lại
- Monitor các tiến trình NodeJs

## Cài đặt PM2

Khuyến khích cài global cho tiện sử dụng

```bash
npm install pm2@latest -g
```

## Sử dụng PM2

### Chạy app bằng PM2

```bash
pm2 start <fileName>: Start a file with pm2 (usually dist/index.js)
pm2 start <fileName> --watch: Start a file with pm2 and watch for changes

```

### Quản lý các tiến trình

```bash
pm2 restart <id, fileName or all>: Restart a process by id, file name or all
pm2 stop <id, fileName or all>: Stop a process by id, file name or all
pm2 delete <id, fileName or all>: Delete a process by id, file name or all
```

Thay vì `app_name` chúng ta có thể truyền

- `all` để thực hiện trên tất cả process
- `id` để thực hiện trên một process id cụ thể

### Kiểm tra trạng thái, logs, metric

Hiển thị danh sách các tiến trình đang chạy

```bash
pm2 list or pm2 ls: List all running processes
```

Hiển thị logs của một tiến trình (`log` hay `logs` đều được)

```bash
pm2 logs or app_name: Show logs of all processes or a specific process
```

```bash
pm2 logs app_name --lines <number> or pm2 log lines <number>: Show the last n lines of logs
  Để hiển thị nhiều dòng hơn thì thêm `--lines` vào
```

Hiển thị metric dashboard

```bash
pm2 monit: Show the monitor of all processes
```

### Tạo file cấu hình

Tạo file `ecosystem.config.js` trong thư mục gốc của project

```js
// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'twitter',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'development', // Riêng NODE_ENV thì có thể dùng process.env.NODE_ENV hoặc process.NODE_ENV, còn lại thì chỉ được dùng process.env.TEN_BIEN
        TEN_BIEN: 'Gia tri'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

Chạy app bằng file cấu hình

Mặc định câu lệnh dưới đây sẽ dùng `env` trong file cấu hình

```bash
pm2 start ecosystem.config.js
```

Muốn dùng `env_production` thì thêm `--env production` vào

```bash
pm2 start ecosystem.config.js --env production
```
