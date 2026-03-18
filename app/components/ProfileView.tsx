'use client';

import { useState } from 'react';

export default function ProfileView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'lists', 'archives'

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5 text-center">
        <div className="relative mb-5">
          <img 
            src={data.avatar_url || '/icons/default_profile.jpg'} 
            className="w-[96px] h-[96px] rounded-full object-cover border-2 border-white ring-1 ring-gray-100" 
            alt={data.username}
          />
        </div>
        <h2 className="text-[22px] font-black tracking-tight mb-1">{data.username}</h2>
        {data.bio && (
          <p className="text-[14px] text-gray-500 font-medium mb-6 px-6 leading-relaxed max-w-[320px]">
            {data.bio}
          </p>
        )}

        {/* Stats Row (Extreme Clean - No borders) */}
        <div className="flex items-center justify-between w-full max-w-[280px] mt-4 mb-4 py-2 px-6">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[17px] font-black">{data.followers_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로워</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
             <span className="text-[17px] font-black">{data.following_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로잉</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-100"></div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[17px] font-black">{data.works_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">작품</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu (Flat Design, No Shadow) */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-40 flex h-[54px] border-b border-gray-50">
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

      {/* Tab Content Rendering */}
      <div className="flex flex-col min-h-[400px]">
        {activeTab === 'posts' && <PostGrid posts={data.initial_posts} />}
        {activeTab === 'lists' && <ListSection lists={data.initial_lists} />}
        {activeTab === 'archives' && <PostGrid posts={data.initial_archives} />}
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
      <img src={icon} className={`w-6 h-6 object-contain ${active ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`} />
      {active && <div className="absolute bottom-0 w-8 h-[2px] bg-black"></div>}
    </button>
  );
}

function PostGrid({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <EmptyState message="기록이 없습니다." />;
  }

  return (
    <div className="grid grid-cols-3 gap-[2px] bg-gray-100 border-b border-gray-100">
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

function ListSection({ lists }: { lists: any[] }) {
  if (!lists || lists.length === 0) {
    return <EmptyState message="리스트가 없습니다." />;
  }

  return (
    <div className="flex flex-col pt-6 px-5 gap-6">
      {lists.map((list : any) => (
        <div key={list.id} className="flex items-center group active:opacity-70 transition-opacity pb-6 border-b border-gray-50 last:border-0">
          <img 
            src={list.cover_url || '/icons/default_profile.jpg'} 
            className="w-24 h-24 rounded-[20px] object-cover mr-5 border border-gray-50 bg-gray-50"
          />
          <div className="flex flex-col justify-center">
            <h3 className="text-[17px] font-black mb-1 leading-tight">{list.title}</h3>
            <p className="text-[12px] text-gray-400 font-medium">작품 {list.works_count}개</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 text-center text-gray-300 text-[15px] font-medium">
      {message}
    </div>
  );
}
