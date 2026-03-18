import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchContent(type: string, id: string) {
  try {
    let query;
    if (type === "work") {
      query = supabase.from("works").select("work_title, image_url, biography, artist_name, display_artist_name").eq("id", id);
    } else if (type === "post") {
      // ⚠️ 주의: profiles, works 테이블명 그대로 사용 (FK 관계에 따라 자동 매핑)
      query = supabase.from("posts").select("content, profiles(username, avatar_url), works(work_title, image_url, artist_name)").eq("id", id);
    } else if (type === "profile") {
      query = supabase.from("profiles").select("username, avatar_url, bio").eq("id", id);
    } else if (type === "artist") {
      query = supabase.from("artists").select("name, profile_path, biography").eq("id", id);
    } else if (type === "list") {
      query = supabase.from("lists").select("title, cover_url, profiles(username)").eq("id", id);
    } else {
      return { data: null, error: `Invalid Type: ${type}` };
    }
    
    const { data, error } = await query.maybeSingle();
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }): Promise<Metadata> {
  const { type, id } = await params;
  const { data }: any = await fetchContent(type, id);
  // ... (기존 메타데이터 로직은 유지)

  let title = "TASH";
  let description = "창작물을 발견하고 기록하는 공간";
  let image = "https://tash.kr/logo.png";

  if (data) {
    if (type === "work") {
      title = data.work_title;
      image = data.image_url || image;
    } else if (type === "post") {
      title = `${data.profiles?.username || "TASH 유저"}님의 기록`;
      description = data.content;
      image = data.works?.image_url || image;
    } else if (type === "profile") {
      title = `${data.username}님의 프로필`;
      description = data.bio || description;
      image = data.avatar_url || image;
    } else if (type === "artist") {
      title = data.name;
      image = data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : image;
    } else if (type === "list") {
      title = data.title;
      image = data.cover_url || image;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "website",
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const { data, error }: any = await fetchContent(type, id);

  if (!data) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold mb-4">정보를 찾을 수 없습니다.</h1>
        <div className="text-left bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-500 max-w-sm overflow-auto">
          <p>Type: {type}</p>
          <p>ID: {id}</p>
          {error && <p className="mt-2 text-red-400">Error: {JSON.stringify(error)}</p>}
        </div>
        <a href="/" className="mt-8 text-blue-500 underline">홈으로 이동</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md flex items-center px-4 z-50 border-b border-gray-50">
        <div className="w-10 h-10 flex items-center justify-center">
            <img src="https://tash.kr/logo.png" className="w-6 opacity-80" alt="TASH" />
        </div>
      </header>

      <main className="pt-14 px-5 max-w-2xl mx-auto">
        {/* Render based on content type */}
        {type === 'work' && <WorkLayout data={data} />}
        {type === 'post' && <PostLayout data={data} />}
        {type === 'profile' && <ProfileLayout data={data} />}
        {type === 'artist' && <ArtistLayout data={data} />}
        {type === 'list' && <ListLayout data={data} />}
      </main>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent flex justify-center">
        <a href={`tash://${type}/${id}`} className="w-full max-w-md py-4 bg-black text-white rounded-2xl font-bold text-center shadow-2xl transition-transform active:scale-95">
          앱에서 열기
        </a>
      </div>
    </div>
  );
}

function WorkLayout({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-[73%] aspect-[2/3] mb-8 relative">
        <img src={data.image_url} className="w-full h-full object-cover rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100" />
      </div>
      <h2 className="text-2xl font-black mb-1 text-center px-4 leading-tight">{data.work_title}</h2>
      <p className="text-gray-500 font-semibold mb-8">{data.display_artist_name || data.artist_name || "TASH"}</p>
      {data.biography && (
        <div className="w-full text-left bg-gray-50/70 p-7 rounded-[28px] text-gray-700 leading-relaxed tracking-tight whitespace-pre-wrap text-[15px]">
          {data.biography}
        </div>
      )}
    </div>
  );
}

function PostLayout({ data }: { data: any }) {
  return (
    <div className="py-6">
      {/* Profile Header */}
      <div className="flex items-center mb-6">
        <img src={data.profiles?.avatar_url || 'https://tash.kr/logo.png'} className="w-10 h-10 rounded-full border border-gray-100 object-cover mr-3" />
        <span className="font-bold text-[17px]">{data.profiles?.username}</span>
      </div>

      {/* Work Info Box */}
      <div className="bg-[#F8F9FA] rounded-2xl p-4 flex items-center mb-6 border border-gray-100/50">
        <img src={data.works?.image_url} className="w-14 h-20 rounded-lg object-cover mr-4 shadow-sm" />
        <div className="flex flex-col">
          <span className="font-bold text-[15px] line-clamp-1 mb-0.5">{data.works?.work_title}</span>
          <span className="text-xs text-gray-400 font-medium">{data.works?.artist_name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-[17px] leading-relaxed whitespace-pre-wrap text-[#1A1A1A] px-1">
        {data.content}
      </div>
    </div>
  );
}

function ProfileLayout({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center py-12">
      <img src={data.avatar_url || 'https://tash.kr/logo.png'} className="w-32 h-32 rounded-full border-2 border-gray-50 object-cover mb-6 shadow-xl" />
      <h2 className="text-2xl font-black mb-4">{data.username}</h2>
      {data.bio && (
        <p className="text-center text-gray-600 leading-relaxed max-w-sm px-6 text-[15px]">
          {data.bio}
        </p>
      )}
    </div>
  );
}

function ArtistLayout({ data }: { data: any }) {
    const imageUrl = data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : 'https://tash.kr/logo.png';
    return (
      <div className="flex flex-col items-center py-10">
        <img src={imageUrl} className="w-40 h-40 rounded-full object-cover mb-8 shadow-xl border-4 border-white" />
        <h2 className="text-2xl font-black mb-8">{data.name}</h2>
        {data.biography && (
          <div className="w-full text-left bg-gray-50/70 p-7 rounded-[28px] text-gray-700 leading-relaxed tracking-tight whitespace-pre-wrap text-[15px]">
            {data.biography}
          </div>
        )}
      </div>
    );
}

function ListLayout({ data }: { data: any }) {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-48 aspect-square mb-8 relative">
          <img src={data.cover_url} className="w-full h-full object-cover rounded-3xl shadow-xl border border-gray-50" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">{data.title}</h2>
        <p className="text-gray-400 text-sm">Created by {data.profiles?.username}</p>
      </div>
    );
}
