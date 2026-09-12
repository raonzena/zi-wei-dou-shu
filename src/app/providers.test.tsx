import {
  atom,
  createStore,
  getDefaultStore,
  Provider,
  useAtomValue,
} from 'jotai';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Providers } from './providers';

vi.mock('../components/ui/toast.css', () => ({
  viewport: 'viewport',
  toast: 'toast',
  content: 'content',
  title: 'title',
  close: 'close',
}));

describe('Providers의 SSR 상태 격리', () => {
  it('서로 다른 페이지 렌더링이 provider-less 전역 상태를 읽지 않는다', () => {
    const privateValue = atom('empty');
    const globalStore = getDefaultStore();
    globalStore.set(privateValue, 'another-user');

    function ReadValue() {
      return <span>{useAtomValue(privateValue)}</span>;
    }

    try {
      for (let request = 0; request < 2; request += 1) {
        expect(
          renderToStaticMarkup(
            <Providers>
              <ReadValue />
            </Providers>,
          ),
        ).toBe('<span>empty</span>');
      }
    } finally {
      globalStore.set(privateValue, 'empty');
    }
  });

  it('상위 트리의 store를 새 앱 Provider로 전달하지 않는다', () => {
    const privateValue = atom('empty');
    const parentStore = createStore();
    parentStore.set(privateValue, 'parent-user');

    function ReadValue() {
      return <span>{useAtomValue(privateValue)}</span>;
    }

    expect(
      renderToStaticMarkup(
        <Provider store={parentStore}>
          <Providers>
            <ReadValue />
          </Providers>
        </Provider>,
      ),
    ).toBe('<span>empty</span>');
  });
});
