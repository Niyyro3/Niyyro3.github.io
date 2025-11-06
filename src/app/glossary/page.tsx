'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateGlossaryEntry, type GenerateGlossaryEntryOutput } from '@/ai/flows/generate-glossary-entry';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function GlossaryPage() {
  const [term, setTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<GenerateGlossaryEntryOutput | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      toast({
        variant: 'destructive',
        title: 'Term is required',
        description: 'Please enter a term to look up.',
      });
      return;
    }

    setIsLoading(true);
    setEntry(null);

    try {
      const result = await generateGlossaryEntry({ term });
      setEntry(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a glossary entry for this term. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Visual Science Glossary"
        description="Look up a key term and the AI will generate a definition and a visual diagram."
      />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter a Scientific Term</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                placeholder="e.g., Mitosis, Covalent Bond, Momentum"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="w-full h-64" />
            </CardContent>
          </Card>
        )}

        {entry && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline capitalize">{term}</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-start">
              <div className="prose prose-lg dark:prose-invert">
                <p>{entry.definition}</p>
              </div>
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                <Image
                  src={entry.imageUrl}
                  alt={`Diagram for ${term}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
