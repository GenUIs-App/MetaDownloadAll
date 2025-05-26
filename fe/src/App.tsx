import { Sidebar } from './components/Sidebar'
import { MediaGrid } from './components/MediaGrid'

const mediaItems = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAC-MKXVIlnrHm0qOjerVjDBZk8yYNweJl2bVcuoTiXw59YsQueuAtwxYT7Cw1m9jWKD0U-3a29vl9K1jUXpGm6c6lVJNzPVJmSu4-3xqYRy9pg6U8t-J5JZ9tywFw2gwASc8MSzO-KZ4MGLJAo41Jmr8F8IO43qPMcmh2zQzzaNxn2G5hreojQZb6FvpYDLOTORRO-If7VQLGiARJHRL-huu42Fk3rNvCkVSZ6Bf7xx0UVCEuFnhYE6feWU1GxzaPw2Cw53P4ZrxAo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuACjXYVz0ARDw3_DM5weGVmwBU5Bm4f7EvVSgWHA3HGdPgTSfes2z3h6RKyZRvZEyg10KegfjtvV9B0G_q5hpXbPw4PBVUOR1kB31rm8c65DWMlMvcj80xiQrvnHJ1Uy9n7XfoNisife_T0N9l_Z6uJtIzNXkmCnq4mzC3JlLntEYZOXnrMiIHWUgJRrHP7D091q5dpxVLuygM-RLe0aSMQy4VZmvdpS3elkOcz9MUaQXY4d235r1lwaGhH87yn0x1H4mypthhAY6Sv',
  // Add more image URLs as needed
].map((url) => ({ imageUrl: url }));

const socialMediaOptions = ['Story', 'Post', 'Reels', 'Videos'];

function App() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80 bg-white rounded-xl">
            <Sidebar socialMedia="Facebook" options={socialMediaOptions} />
          </div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 bg-white rounded-xl">
            <MediaGrid items={mediaItems} title="Story" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
