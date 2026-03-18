import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchContent(type: string, id: string) {
  try {
    if (type === "work") {
      return await supabase.from("works").select("title, image_url, biography").eq("id", id).maybeSingle();
    } else if (type === "post") {
      return await supabase.from("posts").select("content, profiles(username, avatar_url), works(image_url)").eq("id", id).maybeSingle();
    } else if (type === "profile") {
      return await supabase.from("profiles").select("username, avatar_url, bio").eq("id", id).maybeSingle();
    } else if (type === "artist") {
      return await supabase.from("artists").select("name, profile_url, biography").eq("id", id).maybeSingle();
    } else if (type === "list") {
      return await supabase.from("user_lists").select("title, cover_url").eq("id", id).maybeSingle();
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
  return { data: null };
}

export async function generateMetadata({ params }: { params: { type: string; id: string } }): Promise<Metadata> {
  const { type, id } = params;
  const { data }: any = await fetchContent(type, id);

  let title = "TASH";
  let description = "창작물을 발견하고 기록하는 공간";
  let image = "https://tash.kr/logo.png";

  if (data) {
    if (type === "work") {
      title = data.title;
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
      image = data.profile_url || image;
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

export default async function SharePage({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params;
  const { data }: any = await fetchContent(type, id);

  let title = "TASH";
  let description = "창작물을 발견하고 기록하는 공간";
  let image = "https://tash.kr/logo.png";

  if (data) {
    if (type === "work") {
      title = data.title;
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
      image = data.profile_url || image;
    } else if (type === "list") {
      title = data.title;
      image = data.cover_url || image;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] text-center">
        <img src={image} className="w-48 h-48 mx-auto mb-8 rounded-2xl object-cover shadow-lg bg-gray-50" />
        <h1 className="text-2xl font-bold mb-3 text-black">{title}</h1>
        <p className="text-gray-500 mb-10 leading-relaxed line-clamp-4">{description}</p>
        
        <div className="space-y-4">
          <a href={`tash://${type}/${id}`} className="block w-full py-5 bg-black text-white rounded-2xl font-semibold transition-transform active:scale-95">
            앱에서 열기
          </a>
          <a href={`https://tash.kr`} className="block text-gray-400 text-sm hover:underline">
            TASH 설치하기
          </a>
        </div>
      </div>
      
      <img src="https://tash.kr/logo.png" className="w-10 opacity-20 mt-12" alt="TASH" />
    </div>
  );
}
