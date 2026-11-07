import { createFileRoute } from '@tanstack/react-router';
import { PodiumPage } from '@/features/podiums/components/podium-page';

export const Route = createFileRoute('/podiums')({ component: PodiumPage });
