import { beforeEach, expect, it, vi } from 'vitest';
import { createSavedResult, retrySavedExplanation } from './actions';
const m = vi.hoisted(() => ({
  calculate: vi.fn(),
  save: vi.fn(),
  load: vi.fn(),
  update: vi.fn(),
  ai: vi.fn(),
  content: vi.fn(),
}));
vi.mock('../../server/results/fingerprint.server', () => ({
  resultFingerprint: () => 'a'.repeat(64),
}));
vi.mock('../birth-input/calculate-action', () => ({
  calculatePreview: m.calculate,
}));
vi.mock('../../server/content/star-content.server', () => ({
  getStarContent: m.content,
}));
vi.mock('../../server/results/store.server', () => ({
  saveResult: m.save,
  loadResult: m.load,
  updateResultAi: m.update,
}));
vi.mock('../../server/interpretation/request.server', () => ({
  requestExplanation: m.ai,
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'true');
  m.calculate.mockResolvedValue({
    success: true,
    chart: {},
    reading: {},
    facts: {},
    ai: { status: 'not-requested' },
  });
  m.save.mockResolvedValue({ id: 'saved-id', created: true });
  m.ai.mockResolvedValue({ status: 'not-requested' });
  m.content.mockResolvedValue({ status: 'ready', entries: [] });
});

function form(includeAi = false) {
  const result = new FormData();
  result.set('name', '설화');
  result.set('gender', 'female');
  if (includeAi) result.set('includeAi', 'on');
  return result;
}

it('입력한 성별을 캐릭터 복원용으로 저장한다', async () => {
  await createSavedResult(form());
  expect(m.save).toHaveBeenCalledWith(
    expect.objectContaining({ characterGender: 'female' }),
    expect.any(String),
  );
});

it('does not call AI if storage fails and preserves an input error', async () => {
  m.save.mockRejectedValue(new Error('private'));
  const result = await createSavedResult(form(true));
  expect(result.success).toBe(false);
  expect(JSON.stringify(result)).not.toContain('private');
  expect(m.ai).not.toHaveBeenCalled();
  expect(m.calculate.mock.calls[0][0].has('includeAi')).toBe(false);
});
it('saves before AI and returns the saved link even if AI update fails', async () => {
  m.update.mockRejectedValue(new Error('storage'));
  expect(await createSavedResult(form(true))).toEqual({
    success: true,
    id: 'saved-id',
  });
  expect(m.save.mock.invocationCallOrder[0]).toBeLessThan(
    m.ai.mock.invocationCallOrder[0],
  );
});
it('rejects malformed AI options and calculation failures without saving', async () => {
  const malformed = form();
  malformed.set('includeAi', 'wrong');
  expect((await createSavedResult(malformed)).success).toBe(false);
  expect(m.calculate).not.toHaveBeenCalled();
  m.calculate.mockResolvedValue({
    success: false,
    errors: { hour: 'required' },
  });
  expect((await createSavedResult(form())).success).toBe(false);
  expect(m.save).not.toHaveBeenCalled();
});
it('never calls AI for a public visitor retry or when disabled', async () => {
  m.load.mockResolvedValue(null);
  await retrySavedExplanation('id');
  expect(m.load).toHaveBeenCalledWith('id', true);
  expect(m.ai).not.toHaveBeenCalled();
  m.load.mockResolvedValue({
    snapshot: { ai: { status: 'error', retryable: true }, chart: {} },
  });
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'false');
  await retrySavedExplanation('id');
  expect(m.ai).not.toHaveBeenCalled();
});

it('returns a reused result without another AI call or update', async () => {
  m.save.mockResolvedValue({ id: 'existing-id', created: false });
  expect(await createSavedResult(form(true))).toEqual({
    success: true,
    id: 'existing-id',
  });
  expect(m.ai).not.toHaveBeenCalled();
  expect(m.update).not.toHaveBeenCalled();
});

it('이름을 결과에 저장하고 계산 엔진에는 전달하지 않는다', async () => {
  await createSavedResult(form());
  expect(m.calculate.mock.calls[0][0].has('name')).toBe(false);
  expect(m.save.mock.calls[0][0].name).toBe('설화');
});

it('명반 계산과 별 콘텐츠 조회를 동시에 시작한다', async () => {
  let finishCalculation!: (value: unknown) => void;
  const calculation = new Promise((resolve) => {
    finishCalculation = resolve;
  });
  m.calculate.mockReturnValueOnce(calculation);

  const pending = createSavedResult(form());
  await vi.waitFor(() => {
    expect(m.calculate).toHaveBeenCalledOnce();
    expect(m.content).toHaveBeenCalledOnce();
  });

  finishCalculation({
    success: true,
    chart: {},
    reading: {},
    facts: {},
    ai: { status: 'not-requested' },
  });
  await expect(pending).resolves.toEqual({ success: true, id: 'saved-id' });
});
