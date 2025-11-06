
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateGlossaryEntry, type GenerateGlossaryEntryOutput } from '@/ai/flows/generate-glossary-entry';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [term, setTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<GenerateGlossaryEntryOutput | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      toast({
        variant: 'destructive',
        title: 'Search term is required',
        description: 'Please enter a term to search for.',
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
        description: 'Could not generate an explanation for this term. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI History Search"
        description="Look up any key term, person, or event and the AI will generate a detailed explanation."
      />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter a Historical Term or Concept</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                placeholder="e.g., 'The Treaty of Versailles', 'The Norman Conquest', 'The Cold War'"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardHeader>
               <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4 prose prose-lg dark:prose-invert max-w-none">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </CardContent>
          </Card>
        )}

        {entry && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline capitalize">{term}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg dark:prose-invert max-w-none"
                   dangerouslySetInnerHTML={{ __html: entry.explanation }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
