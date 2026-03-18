import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import ProfileView from "../../components/ProfileView";
import AppActionButton from "../../components/AppActionButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchContent(type: string, id: string) {
  const decodedId = decodeURIComponent(id);
  
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { data: null, error: "Config Missing" };

    let query;
    if (type === "work") {
      query = supabase.from("works").select("*").eq("id", decodedId);
    } else if (type === "post") {
      query = supabase.from("posts").select("*, profiles(*), works(*)").eq("id", decodedId);
    } else if (type === "profile") {
      // 프로필 고도화: 통계 및 탭 데이터 멀티 페칭
      const profilePromise = supabase.from("profiles").select("*").eq("id", decodedId).single();
      const followersPromise = supabase.from("follows").select("*", { count: 'exact', head: true }).eq("following_id", decodedId);
      const followingPromise = supabase.from("follows").select("*", { count: 'exact', head: true }).eq("follower_id", decodedId);
      const worksCountPromise = supabase.from("work_likes").select("*", { count: 'exact', head: true }).eq("user_id", decodedId);
      const postsPromise = supabase.from("posts").select("*, works(image_url)").eq("user_id", decodedId).order("created_at", { ascending: false }).limit(12);
      const listsPromise = supabase.from("lists").select("*").eq("user_id", decodedId).order("created_at", { ascending: false }).limit(6);
      const archivesPromise = supabase.from("work_likes").select("*, works(image_url)").eq("user_id", decodedId).order("created_at", { ascending: false }).limit(12);

      const [profileRes, followersRes, followingRes, worksRes, postsRes, listsRes, archivesRes]: any = await Promise.all([
        profilePromise, followersPromise, followingPromise, worksCountPromise, postsPromise, listsPromise, archivesPromise
      ]);

      if (profileRes.error) return { data: null, error: profileRes.error };

      return {
        data: {
          ...profileRes.data,
          // DB 컬럼의 카운트를 우선 사용 (앱과 동일)
          followers_count: profileRes.data.followers_count || 0,
          following_count: profileRes.data.following_count || 0,
          works_count: profileRes.data.works_count || 0,
          initial_posts: postsRes.data || [],
          initial_lists: listsRes.data || [],
          initial_archives: archivesRes.data || []
        }
      };
    } else if (type === "artist") {
      query = supabase.from("artists").select("*").eq("id", decodedId);
    } else if (type === "list") {
      query = supabase.from("lists").select("*, profiles(*)").eq("id", decodedId);
    } else {
      return { data: null, error: `Invalid Type: ${type}` };
    }
    
    const { data, error } = await query.single();
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }): Promise<Metadata> {
  const { type, id } = await params;
  const { data }: any = await fetchContent(type, id);

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
        <a href="/" className="mt-8 text-blue-500 underline">홈으로 이동</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md flex items-center px-6 z-50 border-b border-gray-50">
        <img src="/icons/app_logo.png" className="h-6 object-contain" alt="TASH" />
      </header>

      <main className="pt-14 px-5 max-w-2xl mx-auto">
        {/* Render based on content type */}
        {type === 'work' && <WorkLayout data={data} />}
        {type === 'post' && <PostLayout data={data} />}
        {type === 'profile' && <ProfileView data={data} />}
        {type === 'artist' && <ArtistLayout data={data} />}
        {type === 'list' && <ListLayout data={data} />}
      </main>

      {/* Floating CTA (Client Component to handle deep link reliably) */}
      <AppActionButton type={type} id={id} />
    </div>
  );
}

function WorkLayout({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-[73%] aspect-[2/3] mb-8 relative">
        <img src={data.image_url} className="w-full h-full object-cover rounded-2xl border border-gray-100" />
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
        <img src={data.profiles?.avatar_url || '/icons/default_profile.jpg'} className="w-10 h-10 rounded-full border border-gray-100 object-cover mr-3" />
        <span className="font-bold text-[17px]">{data.profiles?.username}</span>
      </div>

      {/* Work Info Box */}
      <div className="bg-[#F8F9FA] rounded-2xl p-4 flex items-center mb-6 border border-gray-100/50">
        <img src={data.works?.image_url} className="w-14 h-20 rounded-lg object-cover mr-4 border border-gray-200/30" />
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


function ArtistLayout({ data }: { data: any }) {
    const imageUrl = data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : '/icons/default_profile.jpg';
    return (
      <div className="flex flex-col items-center py-10">
        <img src={imageUrl} className="w-40 h-40 rounded-full object-cover mb-8 border-4 border-white ring-1 ring-gray-100" />
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
          <img src={data.cover_url} className="w-full h-full object-cover rounded-3xl border border-gray-50" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">{data.title}</h2>
        <p className="text-gray-400 text-sm">Created by {data.profiles?.username}</p>
      </div>
    );
}
