import 'server-only';
import OpenAI from 'openai';
import { ZodError } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import type { Chart } from '../../domain/ziwei/chart';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { consultationInstructions } from './consultation-prompt';
import {
  aiExplanationSchemaFor,
  validateAiExplanation,
  type AiExplanationResult,
} from '../../domain/interpretation/ai-explanation';

export const explanationModel = 'gpt-5.4-mini-2026-03-17';
export const explanationPromptVersion = 'user-consultation-v7';

export async function explainChart(chart: Chart): Promise<AiExplanationResult> {
  const evidence = consultationEvidence(chart);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey)
    return {
      status: 'error',
      code: 'unavailable',
      message:
        'AI 설명 서비스가 아직 준비되지 않았습니다. 기본 풀이는 확인할 수 있습니다.',
      retryable: false,
    };
  const client = new OpenAI({ apiKey, timeout: 90_000, maxRetries: 0 });
  try {
    const response = await client.responses.parse({
      model: explanationModel,
      store: false,
      max_output_tokens: 16000,
      reasoning: { effort: 'none' },
      instructions: consultationInstructions,
      input: JSON.stringify(evidence),
      text: {
        format: zodTextFormat(
          aiExplanationSchemaFor(evidence),
          'chart_consultation',
        ),
      },
    });
    if (response.status !== 'completed' || !response.output_parsed)
      return invalidResponse();
    try {
      const explanation = validateAiExplanation(
        response.output_parsed,
        evidence,
      );
      return {
        status: 'ready',
        model: explanationModel,
        promptVersion: explanationPromptVersion,
        ...explanation,
      };
    } catch {
      return invalidResponse();
    }
  } catch (error) {
    // Never forward provider messages, prompts, API keys, or response bodies to the browser/logs.
    if (error instanceof OpenAI.APIConnectionTimeoutError)
      return {
        status: 'error',
        code: 'timeout',
        message:
          'AI 설명을 기다리는 시간이 길어져 중단했습니다. 다시 시도할 수 있습니다.',
        retryable: true,
      };
    if (error instanceof OpenAI.RateLimitError) {
      if (
        error.type === 'insufficient_quota' ||
        [
          'credit_balance_exhausted',
          'organization_spend_limit_exceeded',
          'project_spend_limit_exceeded',
          'organization_usage_limit_exceeded',
        ].includes(error.code ?? '')
      )
        return {
          status: 'error',
          code: 'quota',
          message:
            'AI 설명 서비스의 이용 한도에 도달했습니다. 서비스 운영자의 확인이 필요합니다. 기본 풀이는 계속 볼 수 있습니다.',
          retryable: false,
        };
      return {
        status: 'error',
        code: 'rate-limit',
        message:
          '지금은 AI 요청을 처리하기 어렵습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }
    if (
      error instanceof OpenAI.AuthenticationError ||
      error instanceof OpenAI.PermissionDeniedError
    )
      return {
        status: 'error',
        code: 'unavailable',
        message:
          'AI 설명 서비스 설정을 확인하고 있습니다. 기본 풀이는 확인할 수 있습니다.',
        retryable: false,
      };
    if (error instanceof SyntaxError || error instanceof ZodError)
      return invalidResponse();
    return {
      status: 'error',
      code: 'provider',
      message: 'AI 설명을 가져오지 못했습니다. 다시 시도할 수 있습니다.',
      retryable: true,
    };
  }
}
function invalidResponse(): AiExplanationResult {
  return {
    status: 'error',
    code: 'invalid-response',
    message:
      'AI 설명이 정해진 형식이나 근거 목록과 맞지 않아 표시하지 않았습니다. 다시 시도할 수 있습니다.',
    retryable: true,
  };
}
