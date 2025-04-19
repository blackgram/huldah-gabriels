import { BsClockHistory } from 'react-icons/bs'

const AdminDashboard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md lg:max-w-[90%] xl:max-w-[100%]">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <BsClockHistory className="text-primary text-5xl" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Dashboard Coming Soon</h2>
            
            <p className="text-gray-600 max-w-lg mb-6">
              Hi lol, I'm still working on this tab to give you detailed analysis on your business orders and income. As the good friend I am.
            </p>
            
            <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 mb-6">
              <div className="bg-primary h-2.5 rounded-full w-3/4"></div>
            </div>
            
            {/* <p className="text-sm text-gray-500">75% Complete • Estimated release: May 2025</p>
            
            <button className="mt-8 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors">
              Get Notified When Ready
            </button> */}
          </div>
        </div>
  )
}

export default AdminDashboard