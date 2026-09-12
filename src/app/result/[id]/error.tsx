'use client';
import Link from 'next/link';
export default function ResultError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>결과를 불러오지 못했습니다</h1>
      <p>저장소 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.</p>
      <button onClick={reset}>다시 불러오기</button>
      <Link href="/">입력 화면으로 이동</Link>
    </main>
  );
}
