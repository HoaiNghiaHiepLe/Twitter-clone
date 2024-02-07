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

      // gửi event chat với nội dung là "Hello from client"
      socket.emit('chat', `Hello from client ${socket.id}`)
    })

    // lắng nghe event hello từ server và log ra nội dung
    socket.on('hello', (data) => {
      console.log('chat from server:', data)
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
