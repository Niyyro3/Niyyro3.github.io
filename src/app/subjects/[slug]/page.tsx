
'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { subjects } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Video, Layers, BrainCircuit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { provideTopicSummary, ProvideTopicSummaryOutput } from '@/ai/flows/provide-topic-summaries';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Topic = (typeof subjects)[0]['topics'][0];
type SubTopic = NonNullable<Topic['subTopics']>[0];


function SummaryDialog({ topic, open, onOpenChange }: { topic: Topic | SubTopic | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [summary, setSummary] = useState<ProvideTopicSummaryOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && topic && !summary) {
            setIsLoading(true);
            provideTopicSummary({ topic: topic.title })
                .then(result => setSummary(result))
                .catch(err => {
                    console.error(err);
                    toast({
                        variant: 'destructive',
                        title: 'Error Generating Summary',
                        description: 'Could not generate a summary for this topic.'
                    })
                })
                .finally(() => setIsLoading(false));
        }
        if(!open) {
            setSummary(null);
        }
    }, [open, topic, summary, toast]);


    if (!topic) return null;

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
              <DialogDescription>
                An AI-generated summary of the key concepts in this topic.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-sm text-foreground max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                  </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: summary?.summary ?? topic.content }}
                />
              )}
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                <Link href={`/quiz/${topic.id}`} passHref>
                    <Button>Take Quiz</Button>
                </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}

function TopicAccordion({ items, subjectName, isPractical = false }: { items: Topic[], subjectName: string, isPractical?: boolean }) {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState<Topic | SubTopic | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const handleReadSummary = (topic: Topic | SubTopic) => {
        setSelectedTopic(topic);
        setIsSummaryModalOpen(true);
    };
    
    const handleWatchVideo = (topic: Topic | SubTopic) => {
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=Edexcel+GCSE+History+${topic.title}`;
        window.open(youtubeSearchUrl, '_blank');
    };

    const handleMakeFlashcards = (topic: Topic | SubTopic) => {
        router.push(`/flashcards?topic=${encodeURIComponent(topic.title)}`);
    };

    return (
        <>
            <Accordion type="single" collapsible className="w-full">
                {items.map((topic) => (
                <AccordionItem value={topic.id} key={topic.id}>
                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    <span className="font-bold mr-3">{topic.title.split(':')[0]}:</span>
                    <span className="text-left flex-1">{topic.title.split(': ')[1]}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                    <div className="p-1">
                        {topic.subTopics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topic.subTopics.map(subTopic => (
                                    <Card key={subTopic.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-base">{subTopic.title}</CardTitle>
                                            <CardDescription className="text-xs">{subTopic.content}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="flex flex-wrap gap-2 mt-auto pt-0">
                                            <Button size="sm" variant="outline" onClick={() => handleReadSummary(subTopic)}>
                                                <BookOpen className="mr-2 h-4 w-4" /> Summary
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleWatchVideo(subTopic)}>
                                                <Video className="mr-2 h-4 w-4" /> Video
                                            </Button>
                                            {!isPractical && (
                                            <Button size="sm" variant="outline" onClick={() => handleMakeFlashcards(subTopic)}>
                                                <Layers className="mr-2 h-4 w-4" /> Flashcards
                                            </Button>
                                            )}
                                            <Link href={`/study/${subTopic.id}`} passHref>
                                                <Button size="sm">
                                                <BrainCircuit className="mr-2 h-4 w-4" /> Study
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                             <div className="p-4 bg-muted/50 rounded-md">
                                <p className="mb-6">{topic.content}</p>
                                <div className="flex flex-wrap gap-2">
                                <Button variant="outline" onClick={() => handleReadSummary(topic)}>
                                    <BookOpen className="mr-2 h-4 w-4" /> Read Summary
                                </Button>
                                <Button variant="outline" onClick={() => handleWatchVideo(topic)}>
                                    <Video className="mr-2 h-4 w-4" /> Watch Video
                                </Button>
                                {!isPractical && (
                                <Button variant="outline" onClick={() => handleMakeFlashcards(topic)}>
                                    <Layers className="mr-2 h-4 w-4" /> Make Flashcards
                                </Button>
                                )}
                                <Link href={`/study/${topic.id}`} passHref>
                                    <Button>
                                    <BrainCircuit className="mr-2 h-4 w-4" /> Study Topic
                                    </Button>
                                </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
            <SummaryDialog topic={selectedTopic} open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen} />
        </>
    )
}

export default function SubjectPage() {
  const { slug } = useParams<{slug: string}>();
  const subject = subjects.find((s) => s.id === slug);

  if (!subject) {
    notFound();
  }

  const heroImage = PlaceHolderImages.find((img) => img.id === subject.image);

  return (
    <>
      <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={subject.name}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-headline">
            {subject.name}
          </h1>
        </div>
      </div>

      <PageHeader
        title="Key Topics"
        description={`Explore the topics within ${subject.name}.`}
      />
      
      <TopicAccordion items={subject.topics} subjectName={subject.name} />

      {subject.practicals && subject.practicals.length > 0 && (
          <div className="mt-12">
            <PageHeader
                title="Historical Environment"
                description={`Explore the historical environment for ${subject.name}.`}
            />
            <TopicAccordion items={subject.practicals} subjectName={subject.name} isPractical={true} />
          </div>
      )}
    </>
  );
}
