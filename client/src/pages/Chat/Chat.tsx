import { useEffect } from 'react'
import { io } from 'socket.io-client'

const Chat = () => {
  // Lấy url của api server từ biến môi trường VITE_API_URL
  const { VITE_API_URL } = import.meta.env

  useEffect(() => {
    // tạo socket với url của api server
    const socket = io(VITE_API_URL)

    // log ra khi có user connect vào server
    socket.on('connect', () => {
      console.log(`user ${socket.id} connected`)
    })

    // log ra khi có user disconnect khỏi server
    socket.on('disconnect', () => {
      console.log(`user ${socket.id} disconnected`)
    })

    return () => {
      // khi component unmount thì disconnect socket
      // Ngắt kết nối khi component unmount
      // Tránh tạo nhiều kết nối socket không cần thiết
      socket.disconnect()
    }
  }, [])

  return <div>Chat</div>
}

export default Chat
