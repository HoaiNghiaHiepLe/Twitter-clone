import { useEffect, useState } from 'react'
import socket from 'src/utils/socket'

const Chat = () => {
  const [value, setValue] = useState<string>('')
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const [messages, setMessages] = useState<any[]>([])
  useEffect(() => {
    // Gán _id của user vào socket.auth khi kết nối tới server
    socket.auth = {
      _id: profile._id
    }

    // Kết nối tới server
    //! Lưu ý: Đảm bảo kết nối với socket được thiết lập
    socket.connect()

    // log ra khi có user connect vào server
    socket.on('connect', () => {
      console.log(`user ${socket.id} connected`)
    })

    // lắng nghe event receive private message từ server
    // Nếu đúng user được nhận tin nhắn thì mới thêm tin nhắn vào state messages
    socket.on('receive private message', (data) => {
      setMessages((prev) => {
        console.log('prev', prev)
        return [...prev, data]
      })
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // emit sự kiện private message và truyền đi 1 object có key content và to
    socket.emit('private message', {
      // nội dung tin nhắn lấy từ state value
      content: value,
      // đến id của user nhận tin nhắn
      to: '65b2386524e7120262946e84'
    })
    setValue('')
  }
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <p>{message.from}</p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className='mx-2 my-4 border-2 hover:bg-slate-50'
          type='text'
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder='Type your message'
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default Chat
