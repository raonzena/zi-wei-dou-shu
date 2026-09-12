import { beforeEach, expect, it, vi } from 'vitest';
import { createSavedResult, retrySavedExplanation } from './actions';
const m = vi.hoisted(() => ({
  calculate: vi.fn(),
  save: vi.fn(),
  load: vi.fn(),
  update: vi.fn(),
  ai: vi.fn(),
}));
vi.mock('../birth-input/calculate-action', () => ({
  calculatePreview: m.calculate,
}));
vi.mock('../../server/content/star-content.server', () => ({
  getStarContent: async () => ({ status: 'ready', entries: [] }),
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
  m.save.mockResolvedValue('saved-id');
  m.ai.mockResolvedValue({ status: 'not-requested' });
});
it('does not call AI if storage fails and preserves an input error', async () => {
  m.save.mockRejectedValue(new Error('private'));
  const form = new FormData();
  form.set('includeAi', 'on');
  const result = await createSavedResult(form);
  expect(result.success).toBe(false);
  expect(JSON.stringify(result)).not.toContain('private');
  expect(m.ai).not.toHaveBeenCalled();
  expect(m.calculate.mock.calls[0][0].has('includeAi')).toBe(false);
});
it('saves before AI and returns the saved link even if AI update fails', async () => {
  const form = new FormData();
  form.set('includeAi', 'on');
  m.update.mockRejectedValue(new Error('storage'));
  expect(await createSavedResult(form)).toEqual({
    success: true,
    id: 'saved-id',
  });
  expect(m.save.mock.invocationCallOrder[0]).toBeLessThan(
    m.ai.mock.invocationCallOrder[0],
  );
});
it('rejects malformed AI options and calculation failures without saving', async () => {
  const form = new FormData();
  form.set('includeAi', 'wrong');
  expect((await createSavedResult(form)).success).toBe(false);
  expect(m.calculate).not.toHaveBeenCalled();
  m.calculate.mockResolvedValue({
    success: false,
    errors: { hour: 'required' },
  });
  expect((await createSavedResult(new FormData())).success).toBe(false);
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
