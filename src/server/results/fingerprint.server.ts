import 'server-only';
import enginePackage from 'iztro/package.json';
import { normalizeBirth } from '../../domain/birth/normalize-birth.server';
import { parseBirthForm } from '../../features/birth-input/form-input';
import { privateDigest } from '../interpretation/controls/identity';
import {
  explanationModel,
  explanationPromptVersion,
} from '../interpretation/explain.server';
import type { ResultSnapshot } from './snapshot';

export function resultFingerprint(
  form: FormData,
  snapshot: ResultSnapshot,
  wantsAi: boolean,
) {
  const secret = process.env.AI_USAGE_HMAC_SECRET?.trim();
  if (!secret || secret.length < 32)
    throw new Error('Result identity unavailable');
  const parsed = parseBirthForm(form);
  if (!parsed.success) throw new Error('Invalid birth input');
  const normalized = normalizeBirth(parsed.input);
  if (!normalized.success) throw new Error('Invalid birth input');
  const { birthInstant, gender, policyVersion, timeZoneDataVersion } =
    normalized.data;
  const { version, name, chart, reading, facts, content } = snapshot;
  const result = { version, name: name ?? null, chart, reading, facts };
  return privateDigest(
    secret,
    'saved-result-v1',
    JSON.stringify({
      birth: { birthInstant, gender, policyVersion, timeZoneDataVersion },
      engine: enginePackage.version,
      result,
      content:
        content.status === 'ready'
          ? {
              ...content,
              entries: [...content.entries].sort((a, b) =>
                a.star_key.localeCompare(b.star_key),
              ),
            }
          : content,
      ai: wantsAi
        ? { model: explanationModel, prompt: explanationPromptVersion }
        : false,
    }),
  );
}
