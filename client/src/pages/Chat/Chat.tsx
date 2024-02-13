import axios from 'axios'
import { useEffect, useState } from 'react'
import { ConversationPayload } from 'src/types/common.type'
import socket from 'src/utils/socket'

const Chat = () => {
  // state lưu trữ nội dung tin nhắn người dùng nhập vào input
  const [value, setValue] = useState<string>('')
  // state lưu trữ tin nhắn
  const [conversations, setConversations] = useState<any[]>([])
  console.log('conversations', conversations)
  // state lưu trữ người nhận tin nhắn
  const [receiver, setReceiver] = useState<{ _id: string; email: string } | undefined>(undefined)
  // lấy thông tin user từ localStorage
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const access_token = localStorage.getItem('access_token')

  // lấy biến môi trường VITE_API_URL từ file .env
  const { VITE_API_URL } = import.meta.env

  // Danh sách user để test send_message hoặc có thể là api lấy danh sách user từ server
  const usernames = ['user_65b8d07c6f997cd8c41ccc0f', 'user_65b2386524e7120262946e84']

  // useEffect chỉ chạy 1 lần khi kết nối với socket ở server
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

    // lắng nghe event receive send_message từ server
    // Nếu đúng user được nhận tin nhắn thì mới thêm tin nhắn vào state conversations
    socket.on('receive_message', (data) => {
      const { payload } = data
      // Khi nhận đc message mới từ server thì thêm message đó vào state conversations
      setConversations((conversations) => {
        return [...conversations, payload]
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

  // useEffect chạy khi receiver thay đổi (khi chọn 1 user trong danh sách user)
  useEffect(() => {
    if (receiver) {
      getConversations(receiver._id)
    }
  }, [receiver])

  // Hàm lấy danh sách cuộc trò chuyện từ server
  const getConversations = (receiver_id: string) => {
    // Nếu không có receiver_id thì return
    if (!receiver_id) return

    axios
      // Gửi request lấy danh sách cuộc trò chuyện từ server
      .get(`conversations/receivers/${receiver_id}`, {
        baseURL: VITE_API_URL,
        // gửi access_token để lấy thông tin sender từ token ở server
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        // Gửi query params limit và page để phân trang
        params: {
          limit: 20,
          page: 1
        }
      })
      .then((res) => {
        setConversations(res.data.result.conversations)
      })
  }

  //  Hàm gửi tin nhắn bằng emit event send_message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // emit sự kiện send_message và truyền đi 1 object conversation chứa thông tin đồng bộ với phía server
    const conversation = {
      // nội dung tin nhắn người dùng nhập vào input
      content: value,
      // đến id của user nhận tin nhắn được lấy từ state receiver
      receiver_id: receiver ? receiver._id : undefined,
      // id người gửi tin nhắn được lấy từ localStorage
      sender_id: profile._id
    } as ConversationPayload

    socket.emit('send_message', {
      payload: conversation
    })
    // sau khi gửi tin nhắn xong thì clear input
    setValue('')
    // thêm tin nhắn mới vào state conversations để hiển thị ngay lập tức lên màn hình
    setConversations((prev) => {
      return [
        ...prev,
        {
          // tin nhắn mới được thêm vào state conversations
          ...conversation,
          // vì không có _id từ server nên tạo 1 _id ngẫu nhiên và thêm vào state conversations để render khồng bị lỗi
          // Sau khi get lại đc conversations từ server thì sẽ lấy data từ server với đầy đủ _id và không cần phải tạo _id ngẫu nhiên
          _id: Math.random().toString(36).substring(7)
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
        <div className='max-h-64 max-w-xs flex-col overflow-y-scroll'>
          {conversations.map((conversation) => (
            <div
              className={conversation.sender_id === profile._id ? 'flex justify-start' : 'flex justify-end'}
              key={conversation._id}
            >
              <p
                className={
                  conversation.sender_id === profile._id
                    ? 'mt-1 w-max rounded-md bg-blue-500 px-2 py-1 text-right text-white'
                    : 'mt-1 w-max rounded-md bg-slate-100 px-2 py-1 text-left text-black'
                }
              >
                {conversation.content}
              </p>
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
