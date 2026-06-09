export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🌙</div>
        <h1 className="text-2xl font-bold text-[#3a2a5a] mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-[#9080b0] text-sm">
          링크가 잘못되었거나 만료된 페이지입니다.
        </p>
      </div>
    </div>
  );
}
