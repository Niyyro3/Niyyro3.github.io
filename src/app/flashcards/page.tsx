
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Wand2,
  Maximize,
  Minimize,
  Trash2,
  CalendarClock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  generateFlashcards,
  type GenerateFlashcardsOutput,
} from '@/ai/flows/generate-flashcards';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subjects } from '@/lib/data';
import Link from 'next/link';

const sampleFlashcards = [
  {
    term: 'The Grand Alliance',
    definition:
      'The alliance between the USA, USSR, and Britain during WWII, united against Nazi Germany.',
  },
  {
    term: 'Yalta Conference',
    definition:
      'A meeting in February 1945 between Churchill, Roosevelt, and Stalin to decide the fate of post-war Europe.',
  },
  {
    term: 'Potsdam Conference',
    definition:
      'A meeting in July-August 1945 between Attlee, Truman, and Stalin where disagreements over Germany became clear.',
  },
];

function FlippableCard({
  term,
  definition,
  isFullscreen,
}: {
  term: string;
  definition: string;
  isFullscreen: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [term]);

  return (
    <div
      className={cn(
        'w-full [perspective:1000px]',
        isFullscreen ? 'h-full' : 'h-64'
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Card className="w-full h-full flex items-center justify-center">
            <CardContent className="p-6">
              <h3
                className={cn(
                  'font-bold font-headline',
                  isFullscreen ? 'text-5xl' : 'text-2xl'
                )}
              >
                {term}
              </h3>
            </CardContent>
          </Card>
        </div>
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="w-full h-full flex items-center justify-center">
            <CardContent
              className={cn(
                'p-6',
                isFullscreen ? 'text-3xl' : 'text-lg'
              )}
            >
              <p>{definition}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FlashcardsPageContent() {
  const searchParams = useSearchParams();
  const topicFromParams = searchParams.get('topic');
  
  const [cards, setCards] = useState(sampleFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [aiTopic, setAiTopic] = useState(topicFromParams || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const allTopics = subjects.flatMap(s => s.topics.flatMap(t => t.subTopics ? [{id: t.id, title: t.title},...t.subTopics] : [{id: t.id, title: t.title}]));


  const handleAiGenerate = async (topic: string) => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Topic is required',
        description: 'Please enter a topic to generate flashcards.',
      });
      return;
    }
    setIsGenerating(true);
    setCurrentIndex(0);
    setCards([]);
    try {
      const result: GenerateFlashcardsOutput = await generateFlashcards({
        topic: topic,
      });
      if (result.flashcards && result.flashcards.length > 0) {
        setCards(result.flashcards);
        setCurrentIndex(0);
        toast({
          title: 'Flashcards Generated!',
          description: `Created ${result.flashcards.length} cards about ${topic}.`,
        });
      } else {
        setCards(sampleFlashcards);
        toast({
          variant: 'destructive',
          title: 'No flashcards generated',
          description:
            'The AI could not generate flashcards for this topic. Please try another one.',
        });
      }
    } catch (error) {
      console.error(error);
      setCards(sampleFlashcards);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description:
          'There was an error generating flashcards. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (topicFromParams) {
      handleAiGenerate(topicFromParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFromParams]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };
  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm && newDefinition) {
      const newCard = { term: newTerm, definition: newDefinition };
      const updatedCards = [...cards, newCard];
      setCards(updatedCards);
      setNewTerm('');
      setNewDefinition('');
      setCurrentIndex(updatedCards.length - 1);
      toast({ title: 'Flashcard added!' });
    }
  };

  const handleDeleteCard = () => {
    if (cards.length === 0) return;

    setCards((prevCards) => {
      const newCards = prevCards.filter((_, index) => index !== currentIndex);
      if (currentIndex >= newCards.length && newCards.length > 0) {
        setCurrentIndex(newCards.length - 1);
      } else if (newCards.length === 0) {
        setCurrentIndex(0);
      }
      return newCards;
    });

    toast({
      title: 'Flashcard deleted',
    });
  };

  const handleAiFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAiGenerate(aiTopic);
  };

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }

  return (
    <>
      <PageHeader
        title="Flashcards"
        description="Test your knowledge with interactive flashcards. Create your own or let the AI generate them."
      />
      <div
        className={cn(
          'grid md:grid-cols-2 gap-8 items-start',
          isFullscreen &&
            'fixed inset-0 bg-background z-50 p-8 md:grid-cols-1'
        )}
      >
        <div
          className={cn(
            'relative',
            isFullscreen && 'h-full flex flex-col justify-center'
          )}
        >
          {isGenerating ? (
            <div className="w-full h-64">
              <Skeleton className="w-full h-full" />
            </div>
          ) : cards.length > 0 ? (
            <>
              <FlippableCard
                key={currentIndex}
                term={cards[currentIndex].term}
                definition={cards[currentIndex].definition}
                isFullscreen={isFullscreen}
              />
              <div className="flex items-center justify-center mt-4 gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevCard}
                  aria-label="Previous card"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {cards.length}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextCard}
                  aria-label="Next card"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-0 right-0 m-2 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteCard}
                  className={cn(
                    isFullscreen && 'text-white bg-black/20 hover:bg-black/40'
                  )}
                  aria-label="Delete card"
                >
                   <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className={cn(
                    isFullscreen && 'text-white bg-black/20 hover:bg-black/40'
                  )}
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <Card className="w-full h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                No flashcards yet. Generate or create some!
              </p>
            </Card>
          )}
        </div>
        <div className={cn('grid gap-8', isFullscreen && 'hidden')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5 text-primary" />
                AI Flashcard Generator
              </CardTitle>
              <CardDescription>Generate flashcards for a specific topic.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAiFormSubmit} className="space-y-4">
                 <Select value={aiTopic} onValueChange={setAiTopic} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <React.Fragment key={subject.id}>
                        <option disabled className="font-bold p-2">{subject.name}</option>
                        {subject.topics.map(topic => (
                          <React.Fragment key={topic.id}>
                            <SelectItem value={topic.title} className="font-semibold pl-4">{topic.title}</SelectItem>
                            {topic.subTopics?.map(subTopic => (
                              <SelectItem key={subTopic.id} value={subTopic.title} className="pl-8">{subTopic.title}</SelectItem>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isGenerating || !aiTopic}>
                  {isGenerating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate with AI
                </Button>
              </form>
            </CardContent>
          </Card>
           <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/flashcards/dates">
                <CardHeader>
                <CardTitle className="flex items-center">
                    <CalendarClock className="mr-2 h-5 w-5 text-primary" />
                    Practice Key Dates
                </CardTitle>
                <CardDescription>Memorize important dates for each of the four main topics.</CardDescription>
                </CardHeader>
            </Link>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Create Your Own Flashcard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCard} className="space-y-4">
                <Input
                  placeholder="Term (e.g., The Grand Alliance)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                />
                <Textarea
                  placeholder="Definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                />
                <Button type="submit">Add Card</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}


export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlashcardsPageContent />
    </Suspense>
  )
}
