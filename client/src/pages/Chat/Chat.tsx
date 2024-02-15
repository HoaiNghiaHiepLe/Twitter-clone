import axios from 'axios'
import { useEffect, useState } from 'react'
import { ConversationPagination, ConversationPayload } from 'src/types/common.type'
import socket from 'src/utils/socket'
import InfiniteScroll from 'react-infinite-scroll-component'
import { CONVERSATION } from 'src/constants/common'

const Chat = () => {
  // state lưu trữ nội dung tin nhắn người dùng nhập vào input
  const [value, setValue] = useState<string>('')
  // state lưu trữ tin nhắn
  const [conversations, setConversations] = useState<any[]>([])
  // state lưu trữ người nhận tin nhắn
  const [receiver, setReceiver] = useState<{ _id: string; email: string } | undefined>(undefined)
  // state lưu trữ thông tin pagination để infinite scroll
  const [pagination, setPagination] = useState<ConversationPagination>({
    // mặc định page = 1 và total_pages = 0
    page: CONVERSATION.PAGE,
    total_pages: 0
  })

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
      // Vị trí payload là đầu tiên của mảng conversations để hiển thị tin nhăn mới nhất lên ở dưới cùng
      setConversations((conversations) => {
        return [payload, ...conversations]
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
    // Nếu có receiver và page = 1 và total_pages = 0 thì mới gọi hàm getConversations để lấy danh sách cuộc trò chuyện từ server lần đầu
    if (receiver && pagination.page === 1 && pagination.total_pages === 0) {
      getConversations()
    }
  }, [receiver])

  // Hàm lấy danh sách cuộc trò chuyện từ server lần đầu
  const getConversations = () => {
    // Nếu không có receiver_id thì return
    axios
      // Gửi request lấy danh sách cuộc trò chuyện từ server
      .get(`conversations/receivers/${receiver?._id}`, {
        baseURL: VITE_API_URL,
        // gửi access_token để lấy thông tin sender từ token ở server
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        // Gửi query params limit và page để phân trang
        params: {
          // limit cố định, page = 1 lần đầu
          limit: CONVERSATION.LIMIT,
          page: pagination.page
        }
      })
      .then((res) => {
        const { conversations, page, total_pages } = res.data.result
        // set conversations lần đầu khi lấy được danh sách cuộc trò chuyện từ server
        setConversations(conversations)
        // set thông tin pagination lần đầu từ server để infinite scroll
        setPagination({ page, total_pages })
      })
  }

  // Hàm fetch thêm cuộc trò chuyện khi scroll lên top
  const fetchMoreConversations = () => {
    console.log('fetchMoreConversations', receiver, pagination.page, pagination.total_pages)
    if (receiver && pagination.page < pagination.total_pages) {
      axios
        .get(`conversations/receivers/${receiver?._id}`, {
          baseURL: VITE_API_URL,
          headers: {
            Authorization: `Bearer ${access_token}`
          },
          params: {
            // limit cố định, page = page + 1 để lấy dữ liệu tiếp theo
            limit: CONVERSATION.LIMIT,
            page: pagination.page + 1
          }
        })
        .then((res) => {
          const { conversations, page, total_pages } = res.data.result
          // khi load thêm conversations cũ thì giữ lại các conversations cũ và thêm conversations mới vào cuối mảng conversations
          setConversations((prev) => [...prev, ...conversations])
          // set thông tin pagination mới từ server để infinite scroll
          setPagination({ page, total_pages })
        })
    }
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
        {
          // tin nhắn mới được thêm vào state conversations
          // Vị trí đầu tiên của mảng conversations
          ...conversation,
          // vì không có _id từ server nên tạo 1 _id ngẫu nhiên và thêm vào state conversations để render khồng bị lỗi
          // Sau khi get lại đc conversations từ server thì sẽ lấy data từ server với đầy đủ _id và không cần phải tạo _id từ timestamp
          _id: new Date().getTime()
        },
        ...prev
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

  // useEffect chạy để bắt sự kiện scroll lên top để fetch thêm cuộc trò chuyện
  // Nếu k truyền height vào prop của InfiniteScroll thì phải dùng useEffect để bắt sự kiện scroll lên top
  // useEffect(() => {
  //   const handleScroll = (event: any) => {
  //     // Check if scrolled to top
  //     if (event.target.scrollTop === 0) {
  //       fetchMoreConversations()
  //     }
  //   }

  //   const scrollableElement = document.getElementById('scrollableDiv')
  //   scrollableElement?.addEventListener('scroll', handleScroll)

  //   return () => {
  //     scrollableElement?.removeEventListener('scroll', handleScroll)
  //   }
  // }, [pagination, fetchMoreConversations])

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
      <div
        // id của div chứa cuộc trò chuyện để infinite scroll
        id='scrollableDiv'
        className='flex h-64 max-w-sm flex-col'
      >
        <InfiniteScroll
          // dataLength là độ dài của mảng conversations
          dataLength={conversations.length}
          // next là hàm fetchMoreConversations để fetch thêm cuộc trò chuyện khi scroll đến cuối trang
          next={fetchMoreConversations}
          // scrollableTarget là id của div chứa cuộc trò chuyện để infinite scroll
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          inverse={true}
          // hasmore để kiểm tra xem còn dữ liệu để load không
          // khi page < total_pages thì còn dữ liệu để load
          // khi hết dữ liệu để load thì hiển thị endMessage và không còn hiển thị loader
          hasMore={pagination.page < pagination.total_pages}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>You have seen it all</b>
            </p>
          }
          // height là chiều cao của div chứa cuộc trò chuyện để infinite scroll, nếu không truyền height thì phải dùng useEffect để bắt sự kiện scroll lên top
          height={300}
          // loader là component loading khi fetchMoreConversations
          loader={<h4 className='text-center'>Loading...</h4>}
          // scrollableTarget là id của div chứa cuộc trò chuyện để infinite scroll
          scrollableTarget='scrollableDiv'
        >
          {conversations.map((conversation) => (
            <div key={conversation._id}>
              <div className='flex'>
                <p
                  className={
                    conversation.sender_id === profile._id
                      ? 'ml-auto mt-1 w-max rounded-md bg-blue-500 px-2 py-1 text-right text-white'
                      : 'mt-1 w-max rounded-md bg-slate-100 px-2 py-1 text-left text-left text-black'
                  }
                >
                  {conversation.content}
                </p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
        {/* form gửi tin nhắn */}
        <form className='flex py-2' onSubmit={handleSendMessage}>
          <input
            className='mx-1 flex-1 border-2 py-1 hover:bg-slate-50'
            type='text'
            onChange={(e) => setValue(e.target.value)}
            value={value}
            placeholder={`Type your message to ${receiver ? receiver.email : undefined}`}
          />
          <button className='w-max bg-blue-400 px-2 text-white' type='submit'>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
