import { io } from 'socket.io-client'

// Lấy url của api server từ biến môi trường VITE_API_URL
const { VITE_API_URL } = import.meta.env

// tạo socket với url của api server
const socket = io(VITE_API_URL)

export default socket
