import { io } from 'socket.io-client'

// Lấy url của api server từ biến môi trường VITE_API_URL
const { VITE_API_URL } = import.meta.env

// Kết nối tới server với url là VITE_API_URL
//! Lưu ý: Chỉ kết nối duy nhất ở đây thôi, không nên kết nối ở nhiều nơi khác vì sẽ gây rối loạn và tạo ra nhiều kết nối không cần thiết.
//! vd: Nếu kết nối thêm ở nơi khác bằng socket.connect() thì sẽ tạo ra thêm 1 kết nối nữa -> gửi sai Authoization header lên server -> bị middleware verifyAccessToken từ chối kết nối -> Lỗi 401
const socket = io(VITE_API_URL, {
  auth: {
    // gửi Authorization header chứa access_token lên server
    Authorization: `Bearer ${localStorage.getItem('access_token')}`
  }
})

export default socket
