import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://127.0.0.1:8000/videos?page=${currentPage}&page_size=10`)
        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }
        const data = await response.json()
        setVideos(data.data)
        setPagination(data.pagination)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [currentPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
      
      <div className="mx-auto max-w-6xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Channel</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Published</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Thumbnail</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Watch</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video,index) => (
              <tr key={video.id}>
                <td className="border border-gray-300 px-4 py-2">{(pagination.current_page-1)*10+(index + 1)}</td>
                <td className="border border-gray-300 px-4 py-2">{video.title}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <a 
                    href={`https://www.youtube.com/channel/${video.channel_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    {video.channel_title}
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">{new Date(video.published_at).toLocaleString()}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <a href={video.thumbnail_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Thumbnail
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Watch
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="mt-6 flex flex-col items-center space-y-4">
          <p className="text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages} | Total: {pagination.total_count} videos
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.has_previous}
              className={`px-4 py-2 rounded ${
                pagination.has_previous
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
              {currentPage}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.has_next}
              className={`px-4 py-2 rounded ${
                pagination.has_next
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
