# Tối ưu MongoDB

## 1. Index

Trong MongoDB, index là một cấu trúc dữ liệu giúp tăng tốc độ truy vấn và sắp xếp của các câu lệnh trong cơ sở dữ liệu. Nó hoạt động tương tự như bookmark của quyển sách, cần đi đến trang nào thì chỉ cần mở trang đó lên mà không cần phải tìm kiếm từ đầu.

### Ưu điểm của index

Ưu điểm lớn nhất là tăng tốc độ truy vấn, từ đó giảm thiểu thời gian trả kết quả.

### Nhược điểm của index

- Tốn dung lượng lưu trữ: Index tạo ra các bảng chỉ mục riêng biệt, từ đó làm tăng dung lượng bộ nhớ

- Tốn thời gian khi thêm, sửa, xóa dữ liệu: Khi bạn thêm, sửa hoặc xóa dữ liệu trong các trường đã được tạo index, MongoDB sẽ phải cập nhật lại chỉ mục liên quan. Quá trình này tiêu tốn thời gian và tài nguyên hơn so với việc không sử dụng index.

### Giới hạn của index

Một collection chỉ có thể có tối đa 64 index.

Một collection chỉ có 1 index text.

### Một số loại index phổ biến

- Single Field Index: Index trên một trường duy nhất.
- Compound Index: Index trên nhiều trường.
- Search Index: Index trên một trường có kiểu dữ liệu là string, dùng để tìm kiếm.

## 2. Tối ưu khác

Ngoài việc index thì dưới đây là 1 số tips để các bạn có thể tối ưu hơn.

- Phân tích câu truy vấn với `explain`

- Dùng MongoDB Driver lúc nào cũng nhanh hơn dùng các ODM (ORM) như Mongoose, Prisma vì nó bỏ qua lớp ảo hóa và truy vấn trực tiếp vào database.

- Để server MongoDB gần với Server của bạn nhất có thể.
