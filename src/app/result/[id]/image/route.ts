import { resultCharacterImage } from '../../../../server/results/character-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return resultCharacterImage(id);
}
