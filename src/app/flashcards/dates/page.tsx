
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Check,
  X,
  Minus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { keyDates, type DateFlashcard } from '@/lib/key-dates';

type CardRating = 'hard' | 'medium' | 'easy';
type SortMode = 'default' | 'hard-only' | 'random';

// Utility function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function FlippableCard({
  term,
  definition,
  isFullscreen,
  rating,
}: {
  term: string;
  definition: string;
  isFullscreen: boolean;
  rating: CardRating;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [term]);

  const ratingColor = {
    hard: 'bg-red-500',
    medium: 'bg-yellow-500',
    easy: 'bg-green-500',
  };

  return (
    <div
      className={cn(
        'w-full [perspective:1000px]',
        isFullscreen ? 'h-full' : 'h-80' // Taller card for dates
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Card className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-2',
                ratingColor[rating]
              )}
            />
            <CardContent className="p-6">
              <p
                className={cn(
                  'font-medium',
                  isFullscreen ? 'text-4xl' : 'text-xl'
                )}
              >
                {term}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Back of Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="w-full h-full flex items-center justify-center relative bg-card text-destructive overflow-hidden">
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-2',
                ratingColor[rating]
              )}
            />
            <CardContent className="p-6">
              <h3
                className={cn(
                  'font-bold font-headline',
                  isFullscreen ? 'text-7xl' : 'text-5xl'
                )}
              >
                {definition}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function KeyDatesFlashcardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicFromParams = searchParams.get('topic');

  const [selectedTopic, setSelectedTopic] = useState(topicFromParams || '');
  const [allCards, setAllCards] = useState<DateFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [cardRatings, setCardRatings] = useState<Record<string, CardRating>>(
    {}
  );
  const [shuffledCards, setShuffledCards] = useState<DateFlashcard[]>([]);


  // Load ratings from localStorage
  useEffect(() => {
    if (selectedTopic) {
      const storedRatings = localStorage.getItem(`dateRatings-${selectedTopic}`);
      if (storedRatings) {
        setCardRatings(JSON.parse(storedRatings));
      } else {
        setCardRatings({});
      }
    }
  }, [selectedTopic]);

  // Save ratings to localStorage
  const saveRating = useCallback((cardId: string, rating: CardRating) => {
    const newRatings = { ...cardRatings, [cardId]: rating };
    setCardRatings(newRatings);
    localStorage.setItem(
      `dateRatings-${selectedTopic}`,
      JSON.stringify(newRatings)
    );
  }, [cardRatings, selectedTopic]);


  useEffect(() => {
    if (selectedTopic && keyDates[selectedTopic]) {
      const topicCards = keyDates[selectedTopic].dates;
      setAllCards(topicCards);
      setShuffledCards(shuffle([...topicCards]));
      setCurrentIndex(0);
    } else {
      setAllCards([]);
    }
  }, [selectedTopic]);
  
  const displayedCards = useMemo(() => {
    if (sortMode === 'hard-only') {
      return allCards.filter(card => cardRatings[card.event] === 'hard');
    }
    if (sortMode === 'random') {
        return shuffledCards;
    }
    return allCards;
  }, [allCards, sortMode, cardRatings, shuffledCards]);

  useEffect(() => {
    setCurrentIndex(0);
    if (sortMode === 'random') {
        setShuffledCards(shuffle([...allCards]));
    }
  }, [sortMode, allCards]);

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setSortMode('default');
    router.push(`/flashcards/dates?topic=${topic}`);
  };

  const nextCard = () => {
    if (displayedCards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayedCards.length);
  };
  const prevCard = () => {
    if (displayedCards.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + displayedCards.length) % displayedCards.length
    );
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
  };
  
  const currentCard = displayedCards[currentIndex];

  return (
    <>
      <PageHeader
        title="Key Dates Flashcards"
        description="Select a topic and memorize the most important dates for your exams."
      />

      <div className="mb-8 max-w-2xl mx-auto grid sm:grid-cols-2 gap-4">
        <Select value={selectedTopic} onValueChange={handleTopicChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a topic to start..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(keyDates).map(([id, { title }]) => (
              <SelectItem key={id} value={id}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)} disabled={!selectedTopic}>
            <SelectTrigger>
                <SelectValue placeholder="Sort cards..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="random">Random Order</SelectItem>
                <SelectItem value="hard-only">Review "Hard" Cards</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          'grid gap-8 items-start',
          isFullscreen && 'fixed inset-0 bg-background z-50 p-8',
          selectedTopic ? 'grid-cols-1' : 'hidden'
        )}
      >
        <div
          className={cn(
            'relative w-full max-w-2xl mx-auto',
            isFullscreen && 'h-full flex flex-col justify-center'
          )}
        >
          {displayedCards.length > 0 ? (
            <>
              <FlippableCard
                key={currentCard.event + currentIndex}
                term={currentCard.event}
                definition={currentCard.date}
                isFullscreen={isFullscreen}
                rating={cardRatings[currentCard.event] || 'medium'}
              />
              <div className="flex items-center justify-center mt-4 gap-2 md:gap-4">
                 <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveRating(currentCard.event, 'easy')}
                  className="border-green-500 hover:bg-green-100 text-green-600"
                  aria-label="Mark as easy"
                >
                  <Check className="h-5 w-5" />
                </Button>
                 <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveRating(currentCard.event, 'medium')}
                  className="border-yellow-500 hover:bg-yellow-100 text-yellow-600"
                  aria-label="Mark as medium"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                 <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveRating(currentCard.event, 'hard')}
                  className="border-red-500 hover:bg-red-100 text-red-600"
                  aria-label="Mark as hard"
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="flex-grow"></div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevCard}
                  aria-label="Previous card"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground w-16 text-center">
                  {currentIndex + 1} / {displayedCards.length}
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
            <Card className="w-full h-80 flex items-center justify-center">
              <p className="text-muted-foreground p-4 text-center">
                {sortMode === 'hard-only' ? 'You have no cards marked as "Hard" in this topic.' : 'Select a topic above to begin.'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {!selectedTopic && (
        <Card className="w-full max-w-2xl mx-auto h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Please select a topic to view the key date flashcards.
          </p>
        </Card>
      )}
    </>
  );
}
