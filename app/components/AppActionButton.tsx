'use client';

export default function AppActionButton({ type, id }: { type: string, id: string }) {
  const handleOpenApp = (e: React.MouseEvent) => {
    // Custom scheme URL
    const deepLink = `tash://${type}/${id}`;
    
    // Attempt to open the app
    window.location.href = deepLink;
    
    // Optional: Log or track click
    console.log('Opening app:', deepLink);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-white flex justify-center border-t border-gray-50 z-50">
      <button 
        onClick={handleOpenApp}
        className="w-full max-w-md py-4 bg-black text-white rounded-2xl font-bold text-[16px] text-center shadow-lg transition-transform active:scale-95"
      >
        앱에서 열기
      </button>
    </div>
  );
}
