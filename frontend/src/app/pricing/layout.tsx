import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50">

      <div className="">
        <Topbar />
        <main className="">
          {children}
        </main>
      </div>
    </div>
  )
}