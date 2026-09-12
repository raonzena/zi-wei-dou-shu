import Link from 'next/link';
export default function ResultNotFound() {
  return (
    <main>
      <h1>결과를 찾을 수 없습니다</h1>
      <p>주소가 올바르지 않거나 보관 기간이 지났습니다.</p>
      <Link href="/">새 명반 만들기</Link>
    </main>
  );
}
