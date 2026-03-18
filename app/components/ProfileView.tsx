'use client';

import { useState } from 'react';

export default function ProfileView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'lists', 'archives'

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
          <div className="flex flex-col items-center">
            <span className="text-[17px] font-black">{data.followers_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로워</span>
          </div>
          <div className="w-[0.5px] h-3 bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <span className="text-[17px] font-black">{data.following_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">팔로잉</span>
          </div>
          <div className="w-[0.5px] h-3 bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <span className="text-[17px] font-black">{data.works_count}</span>
            <span className="text-[12px] text-gray-400 font-medium">작품</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-50 flex">
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'posts' && <PostGrid posts={data.initial_posts} />}
        {activeTab === 'lists' && <ListSection lists={data.initial_lists} />}
        {activeTab === 'archives' && <PostGrid posts={data.initial_archives} />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-4 text-[15px] font-bold transition-colors relative ${active ? 'text-black' : 'text-gray-300'}`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>}
    </button>
  );
}

function PostGrid({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return <EmptyState message="아직 기록이 없습니다." />;
  }

  return (
    <div className="grid grid-cols-3 gap-[1px] bg-gray-50">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square bg-white relative group active:opacity-80">
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
