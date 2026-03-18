'use client';

import { useState } from 'react';

export default function ProfileView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'lists', 'archives'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

      {/* Tabs Menu */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-40 flex px-2 border-b border-gray-50">
        <div className="flex flex-1">
          <TabButton 
            label="기록" 
            active={activeTab === 'posts'} 
            onClick={() => setActiveTab('posts')} 
          />
          <TabButton 
            label="리스트" 
            active={activeTab === 'lists'} 
            onClick={() => setActiveTab('lists')} 
          />
          <TabButton 
            label="저장" 
            active={activeTab === 'archives'} 
            onClick={() => setActiveTab('archives')} 
          />
        </div>
        
        {/* Toggle Grid/List (Only for posts/archives) */}
        {(activeTab === 'posts' || activeTab === 'archives') && (
          <div className="flex items-center px-2 border-l border-gray-50 ml-2 py-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'text-black opacity-100' : 'text-gray-300 opacity-60 hover:text-gray-500'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'text-black opacity-100' : 'text-gray-300 opacity-60 hover:text-gray-500'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'posts' && (
          viewMode === 'grid' 
            ? <PostGrid posts={data.initial_posts} /> 
            : <PostList posts={data.initial_posts} profile={data} />
        )}
        {activeTab === 'lists' && <ListSection lists={data.initial_lists} />}
        {activeTab === 'archives' && (
          viewMode === 'grid'
            ? <PostGrid posts={data.initial_archives} />
            : <ArchiveList archives={data.initial_archives} />
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-4 text-[15px] font-bold transition-colors relative ${active ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>}
    </button>
  );
}

function PostGrid({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <EmptyState message="아직 기록이 없습니다." />;
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

          <div className="text-[16px] leading-relaxed whitespace-pre-wrap text-black px-1 line-clamp-4">
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

function ArchiveList({ archives }: { archives: any[] }) {
  if (!archives || archives.length === 0) return <EmptyState message="저장된 작품이 없습니다." />;

  return (
    <div className="flex flex-col p-5 gap-4">
      {archives.map(item => (
        <div key={item.work_id} className="flex items-center group active:opacity-70 transition-opacity">
          <img 
            src={item.works?.image_url} 
            className="w-16 h-24 rounded-xl object-cover shadow-sm mr-4 border border-gray-50"
          />
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold mb-1">{item.works?.work_title}</h3>
            <p className="text-[13px] text-gray-400 font-medium">{item.works?.artist_name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSection({ lists }: { lists: any[] }) {
  if (lists.length === 0) {
    return <EmptyState message="아직 리스트가 없습니다." />;
  }

  return (
    <div className="flex flex-col p-5 gap-4">
      {lists.map((list) => (
        <div key={list.id} className="flex items-center group active:opacity-70 transition-opacity">
          <img 
            src={list.cover_url || 'https://tash.kr/logo.png'} 
            className="w-20 h-20 rounded-2xl object-cover shadow-sm mr-4 border border-gray-50"
          />
          <div className="flex flex-col">
            <h3 className="text-[16px] font-bold mb-1">{list.title}</h3>
            <p className="text-[13px] text-gray-400 font-medium">최근 업데이트: {new Date(list.updated_at || list.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-gray-400 text-[14px] font-medium">
      {message}
    </div>
  );
}
