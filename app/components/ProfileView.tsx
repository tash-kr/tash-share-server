'use client';

import { useState, useMemo } from 'react';

type Category = '음악' | '영화' | 'TV' | '책';
type SortBy = 'recent' | 'rating';

export default function ProfileView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'lists', 'archives'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<Category | '전체'>('음악');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  // Filtering Logic (In real app, this would be a server-side query, but for shared link we filter initial data)
  const filteredPosts = useMemo(() => {
    let posts = data.initial_posts || [];
    // (In a real implementation, you'd filter by category here)
    return posts;
  }, [data.initial_posts, activeCategory]);

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5">
        <div className="relative mb-4">
          <img 
            src={data.avatar_url || 'https://tash.kr/logo.png'} 
            className="w-[88px] h-[88px] rounded-full object-cover border-[0.5px] border-gray-100 shadow-sm" 
            alt={data.username}
          />
        </div>
        <h2 className="text-[20px] font-black tracking-tight mb-0.5">{data.username}</h2>
        {data.bio && (
          <p className="text-[13px] text-gray-500 font-medium mb-5 text-center px-6 leading-relaxed">
            {data.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between w-full max-w-[280px] mt-2 mb-4">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[17px] font-black">{data.followers_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로워</span>
          </div>
          <div className="w-[0.5px] h-3 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[17px] font-black">{data.following_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로잉</span>
          </div>
          <div className="w-[0.5px] h-3 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[17px] font-black">{data.works_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">작품</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu (Icon Based) */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-50 flex h-[50px]">
        <TabIconButton 
          icon="/icons/tab_posts.png" 
          active={activeTab === 'posts'} 
          onClick={() => setActiveTab('posts')} 
        />
        <TabIconButton 
          icon="/icons/tab_lists.png" 
          active={activeTab === 'lists'} 
          onClick={() => setActiveTab('lists')} 
        />
        <TabIconButton 
          icon="/icons/tab_archive.png" 
          active={activeTab === 'archives'} 
          onClick={() => setActiveTab('archives')} 
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col min-h-[400px]">
        {/* Record/Post Specific Toolbar */}
        {activeTab === 'posts' && (
          <div className="flex flex-col bg-white">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 px-5 py-4 overflow-x-auto no-scrollbar">
              {['음악', '영화', 'TV', '책'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`px-[18px] py-[7px] rounded-full text-[14px] font-bold border transition-all whitespace-nowrap
                    ${activeCategory === cat 
                      ? 'border-black text-black bg-white shadow-sm' 
                      : 'border-transparent text-gray-300 hover:text-gray-400'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center justify-end px-5 py-3 gap-4 border-t border-gray-50">
               <button 
                onClick={() => setSortBy('rating')}
                className={`text-[13px] font-bold flex items-center ${sortBy === 'rating' ? 'text-black' : 'text-gray-300'}`}
               >
                 별점 <span className="ml-0.5 mt-0.5">↓</span>
               </button>
               <button 
                onClick={() => setSortBy('recent')}
                className={`text-[13px] font-bold flex items-center ${sortBy === 'recent' ? 'text-black' : 'text-gray-300'}`}
               >
                 최근 <span className="ml-0.5 mt-0.5">↓</span>
               </button>
               
               <div className="flex items-center gap-1 ml-2">
                 <button onClick={() => setViewMode('grid')} className={`opacity-${viewMode === 'grid' ? '100' : '30'}`}>
                    <img src="/icons/view_grid.png" className="w-5" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`opacity-${viewMode === 'list' ? '100' : '30'}`}>
                    <img src="/icons/view_list_toggle.png" className="w-5" />
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content Rendering */}
        <div className="flex flex-col">
          {activeTab === 'posts' && (
            viewMode === 'grid' 
              ? <PostGrid posts={filteredPosts} /> 
              : <PostList posts={filteredPosts} profile={data} />
          )}
          {activeTab === 'lists' && <ListSection lists={data.initial_lists} />}
          {activeTab === 'archives' && (
            <div className="mt-4">
               <PostGrid posts={data.initial_archives} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabIconButton({ icon, active, onClick }: { icon: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center transition-all relative h-full`}
    >
      <img src={icon} className={`w-6 h-6 object-contain ${active ? 'opacity-100' : 'opacity-20'}`} />
      {active && <div className="absolute bottom-0 w-10 h-[2px] bg-black"></div>}
    </button>
  );
}

function PostGrid({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <EmptyState message="기록이 없습니다." />;
  }

  return (
    <div className="grid grid-cols-3 gap-[1px] bg-gray-50 border-b border-gray-50">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square bg-white relative group active:opacity-80 transition-opacity">
          <img 
            src={post.works?.image_url || post.image_url} 
            className="w-full h-full object-cover"
            alt="post"
          />
        </div>
      ))}
    </div>
  );
}

function PostList({ posts, profile }: { posts: any[], profile: any }) {
  if (!posts || posts.length === 0) return <EmptyState message="기록이 없습니다." />;

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {posts.map(post => (
        <div key={post.id} className="py-6 px-5 flex flex-col">
          <div className="flex items-center mb-4">
            <img src={profile.avatar_url || 'https://tash.kr/logo.png'} className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-100" />
            <span className="font-bold text-[15px]">{profile.username}</span>
          </div>

          <div className="bg-[#F8F9FA] rounded-[18px] p-4 flex items-center mb-4 border border-gray-50">
            <img src={post.works?.image_url} className="w-12 h-18 rounded-lg object-cover mr-4 shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold text-[14px] line-clamp-1">{post.works?.work_title}</span>
              <span className="text-[12px] text-gray-400 font-medium">{post.works?.artist_name}</span>
            </div>
          </div>

          <div className="text-[16px] leading-relaxed whitespace-pre-wrap text-black px-1">
            {post.content}
          </div>
          
          <div className="mt-4 text-[12px] text-gray-300 font-medium px-1">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSection({ lists }: { lists: any[] }) {
  if (!lists || lists.length === 0) {
    return <EmptyState message="리스트가 없습니다." />;
  }

  return (
    <div className="flex flex-col pt-4 px-5 gap-4">
      {lists.map((list) => (
        <div key={list.id} className="flex items-center group active:opacity-70 transition-opacity border-b border-gray-50 pb-4">
          <img 
            src={list.cover_url || 'https://tash.kr/logo.png'} 
            className="w-20 h-20 rounded-2xl object-cover shadow-sm mr-4 border border-gray-50"
          />
          <div className="flex flex-col">
            <h3 className="text-[16px] font-bold mb-1">{list.title}</h3>
            <p className="text-[13px] text-gray-400 font-medium">{list.description || '목록 설명이 없습니다.'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-gray-300 text-[14px] font-medium">
      {message}
    </div>
  );
}
