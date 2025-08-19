import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('published_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const page = urlParams.get('page')
    const search = urlParams.get('search')
    const sort = urlParams.get('sort')
    const order = urlParams.get('order')

    if (page) setCurrentPage(parseInt(page))
    if (search) setSearchTerm(search)
    if (sort) setSortBy(sort)
    if (order) setSortOrder(order)
  }, [])

  // handle url params for sorting
  useEffect(() => {
    const urlParams = new URLSearchParams()
    if (currentPage > 1) urlParams.set('page', currentPage.toString())
    if (searchTerm) urlParams.set('search', searchTerm)
    if (sortBy !== 'published_at') urlParams.set('sort', sortBy)
    if (sortOrder !== 'desc') urlParams.set('order', sortOrder)

    const newUrl = urlParams.toString() 
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname
    
    window.history.replaceState({}, '', newUrl)
  }, [currentPage, searchTerm, sortBy, sortOrder])


  // data fetching stuff
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

  const getFilteredAndSortedVideos = () => {
    let filtered = [...videos]

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channel_title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'published_at':
          aValue = new Date(a.published_at)
          bValue = new Date(b.published_at)
          break
        default:
          aValue = a.id
          bValue = b.id
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }


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
      
      {/* Search and Sort Controls */}
      <div className="mx-auto max-w-6xl mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">
              Search:
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title or channel..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="published_at">Published Date</option>
              <option value="title">Title</option>
            </select>
            
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
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
            {getFilteredAndSortedVideos().map((video, index) => (
              <tr key={video.id}>
                <td className="border border-gray-300 px-4 py-2">{(pagination?.current_page - 1) * 10 + (index + 1)}</td>
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
