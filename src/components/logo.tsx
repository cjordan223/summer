import { Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ href = '/', className }: { href?: string, className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)} aria-label="Summer home">
      <div className="p-2 bg-primary rounded-lg shadow-md">
        <Clapperboard className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Summer</h1>
    </Link>
  );
}
