"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { findAffiliations } from '@/ai/flows/affiliation-finder';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AffiliationFinderProps {
  dobs: string[];
}

export function AffiliationFinder({ dobs }: AffiliationFinderProps) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFindAffiliations = () => {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const res = await findAffiliations(dobs);
        setResult(res);
      } catch (err) {
        setError('An error occurred while finding affiliations.');
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleFindAffiliations} disabled={isPending} className="w-full">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Find Affiliations with AI
      </Button>

      {isPending && (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Analyzing dates...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert className="animate-fade-in bg-primary/10 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary-foreground/90">AI Analysis Complete</AlertTitle>
          <AlertDescription className="text-primary-foreground/80 whitespace-pre-wrap">
            {result}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
