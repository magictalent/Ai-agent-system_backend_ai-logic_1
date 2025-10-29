import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-[64px] p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
