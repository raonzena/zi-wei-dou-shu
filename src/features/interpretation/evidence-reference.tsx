import type { Chart } from '../../domain/ziwei/chart';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import {
  terms,
  extendedTerms,
  palaceTerms,
  starTerms,
} from '../../content/glossary';
import { Term } from '../../components/ui/term';

export function EvidenceReference({
  id,
  chart,
  facts,
}: {
  id: string;
  chart: Chart;
  facts: ChartFactsData;
}) {
  const [kind, branch, category, name] = id.split(':');
  const definition =
    kind === 'star'
      ? starTerms[`${category}:${name}`]
      : kind === 'palace'
        ? palaceTerms[
            chart.palaces.find((p) => p.earthlyBranch === branch)!.name
          ]
        : kind === 'decadal'
          ? terms.대한
          : kind === 'yearly'
            ? terms.유년
            : kind === 'monthly'
              ? extendedTerms.유월
              : kind === 'flying'
                ? extendedTerms.비화
                : kind === 'pattern'
                  ? extendedTerms.격국
                  : terms.명반;
  return <Term term={{ ...definition, label: facts.references[id] }} />;
}
