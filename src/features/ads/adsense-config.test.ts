import { describe, expect, it } from 'vitest';
import {
  adsTxtEntry,
  parseAdSenseClientId,
  parseAdSenseConfig,
} from './adsense-config';

describe('AdSense 설정', () => {
  it('게시자 ID를 광고 단위 설정과 별도로 검증한다', () => {
    expect(parseAdSenseClientId(' ca-pub-1234567890123456 ')).toBe(
      'ca-pub-1234567890123456',
    );
    expect(parseAdSenseClientId('pub-1234567890123456')).toBeNull();
  });

  it('게시자 ID와 광고 단위 ID가 모두 유효할 때만 설정을 반환한다', () => {
    expect(
      parseAdSenseConfig({
        clientId: ' ca-pub-1234567890123456 ',
        resultSlotId: ' 1234567890 ',
      }),
    ).toEqual({
      clientId: 'ca-pub-1234567890123456',
      resultSlotId: '1234567890',
    });

    expect(
      parseAdSenseConfig({
        clientId: 'ca-pub-1234567890123456',
      }),
    ).toBeNull();
    expect(
      parseAdSenseConfig({
        clientId: 'javascript:alert(1)',
        resultSlotId: '1234567890',
      }),
    ).toBeNull();
    expect(
      parseAdSenseConfig({
        clientId: 'ca-pub-1234567890123456',
        resultSlotId: 'result-slot',
      }),
    ).toBeNull();
  });

  it('유효한 게시자 ID를 ads.txt 항목으로 바꾼다', () => {
    expect(adsTxtEntry('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0',
    );
    expect(adsTxtEntry('pub-1234567890123456')).toBeNull();
  });
});
