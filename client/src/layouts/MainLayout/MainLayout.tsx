import { Outlet } from 'react-router-dom'
import { Header, Footer, Sidebar } from 'src/components/'

export default function MainLayout() {
  return (
    <div className='flex h-screen flex-col'>
      <div className='flex flex-1'>
        <Sidebar />
        <div className='flex flex-1 flex-col'>
          <Header />
          <div className='flex flex-1 flex-col'>
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
