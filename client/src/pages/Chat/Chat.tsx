import axios from 'axios'
import { useEffect, useState } from 'react'
import socket from 'src/utils/socket'

const Chat = () => {
  // state lưu trữ nội dung tin nhắn người dùng nhập vào input
  const [value, setValue] = useState<string>('')
  // state lưu trữ tin nhắn
  const [messages, setMessages] = useState<any[]>([])
  // state lưu trữ người nhận tin nhắn
  const [receiver, setReceiver] = useState<{ _id: string; email: string } | undefined>(undefined)
  // lấy thông tin user từ localStorage
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')

  // lấy biến môi trường VITE_API_URL từ file .env
  const { VITE_API_URL } = import.meta.env

  // Danh sách user để test private message hoặc có thể là api lấy danh sách user từ server
  const usernames = ['user_65b8d07c6f997cd8c41ccc0f', 'user_65b2386524e7120262946e84']

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
      setMessages((messages) => {
        return [
          ...messages,
          {
            // set lại state message để tin nhắn nhận được sẽ có isSender = false
            isSender: false,
            content: data.content
          }
        ]
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

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // emit sự kiện private message và truyền đi 1 object có key content và to
    socket.emit('private message', {
      // nội dung tin nhắn lấy từ state value
      content: value,
      // đến id của user nhận tin nhắn
      to: receiver ? receiver._id : undefined,
      // id người gửi tin nhắn
      from: profile._id
    })
    setValue('')
    setMessages((prev) => {
      return [
        ...prev,
        {
          // set lại state message để tin nhắn gửi đi sẽ có isSender = true
          isSender: true,
          content: value
        }
      ]
    })
  }

  // Hàm lấy thông tin user từ server bằng username
  const getProfile = (username: string) => {
    axios
      .get(`users/${username}`, {
        baseURL: VITE_API_URL
      })
      .then((res) => {
        console.log(res.data)
        setReceiver({ _id: res.data.result._id, email: res.data.result.email })
      })
  }
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div className='my-1' key={username}>
            <button className='rounded-md bg-slate-500 px-2 py-1' onClick={() => getProfile(username)}>
              {username}
            </button>
          </div>
        ))}
      </div>
      <div>
        <div className='max-h-64 max-w-sm overflow-y-scroll'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.isSender
                  ? 'mt-1 rounded-md bg-blue-500 text-right text-white'
                  : 'mt-1 rounded-md bg-slate-100 text-left text-black'
              }
            >
              <p className='px-2 pb-2'>{message.content}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          className='mx-2 my-4 w-96 border-2 hover:bg-slate-50'
          type='text'
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder={`Type your message to ${receiver ? receiver.email : undefined}`}
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default Chat
