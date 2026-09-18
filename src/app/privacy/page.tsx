import type { Metadata } from 'next';
import { Brand } from '../../components/ui/brand';
import * as styles from './styles.css';

export const metadata: Metadata = {
  title: '개인정보 및 쿠키 안내 | 자미두수',
  description: '자미두수 서비스의 개인정보 처리와 광고 쿠키 사용 안내',
};

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <Brand />
      <h1 className={styles.title}>개인정보 및 쿠키 안내</h1>
      <p className={styles.updated}>최종 갱신일: 2026년 9월 14일</p>

      <section>
        <h2 className={styles.sectionTitle}>출생 정보와 명반 결과</h2>
        <p className={styles.paragraph}>
          입력한 생년월일, 출생 시각, 성별은 명반 계산에 사용하며 원본
          생년월일과 출생 시각은 저장하지 않습니다. 선택한 성별은 캐릭터 표시를
          위해 결과와 함께 30일간 저장합니다. 해당 캐릭터는 결과 화면과 공유
          링크의 미리보기에도 표시됩니다. 입력한 이름 또는 닉네임과 계산된 명반,
          풀이는 결과 링크로 다시 볼 수 있도록 30일간 저장합니다. 이름 또는
          닉네임은 공유 링크의 미리보기 제목에도 표시됩니다. 결과 링크를 아는
          사람은 해당 내용을 열람할 수 있으므로 실명 공개가 부담스러우면
          닉네임을 사용하고, 공개를 원하지 않는 곳에는 링크를 공유하지 마세요.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>쿠키와 운영 기록</h2>
        <p className={styles.paragraph}>
          결과를 만든 브라우저를 확인하기 위한 쿠키를 사용합니다. 서비스
          안정성과 사용량 제한을 위해 원본 IP 대신 서버 비밀키로 만든 식별값,
          처리 상태, 시각과 사용량을 최대 약 31일간 보관할 수 있습니다. 이
          식별값을 완전한 익명 정보로 간주하지 않습니다.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Google 광고</h2>
        <p className={styles.paragraph}>
          광고가 활성화되면 Google을 포함한 제3자 광고 사업자가 광고를 제공하기
          위해 쿠키를 저장하거나 읽고, IP 주소나 웹 비콘 같은 정보를 사용할 수
          있습니다. Google과 광고 파트너는 이 사이트나 다른 사이트의 방문 기록을
          바탕으로 맞춤 광고를 제공할 수 있습니다.
        </p>
        <p className={styles.paragraph}>
          맞춤 광고에 사용되는 정보는{' '}
          <a href="https://adssettings.google.com/" rel="noreferrer">
            Google 광고 설정
          </a>
          에서 관리할 수 있습니다. Google이 광고와 관련된 정보를 처리하는 방식은{' '}
          <a
            href="https://policies.google.com/technologies/ads?hl=ko"
            rel="noreferrer"
          >
            Google 광고 정책 안내
          </a>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>외부 서비스와 문의</h2>
        <p className={styles.paragraph}>
          결과 저장에는 Supabase를 사용하며, 광고가 활성화된 경우 Google
          AdSense를 사용합니다. 서비스의 개인정보 및 쿠키 처리에 관한 문의는{' '}
          <a href="https://github.com/raonzena/zi-wei-dou-shu/issues">
            프로젝트 문의 페이지
          </a>
          에 남길 수 있습니다.
        </p>
      </section>
    </main>
  );
}
