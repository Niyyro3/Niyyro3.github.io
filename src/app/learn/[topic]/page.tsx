
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { subjects } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  XCircle,
  Lightbulb,
  Mic,
  Pause,
  Sparkles,
  Video,
  Play,
  Rewind,
  FastForward,
} from 'lucide-react';
import {
  generateLesson,
  type GenerateLessonOutput,
} from '@/ai/flows/generate-lesson';
import { 
  summarizeAndSpeak,
  type SummarizeAndSpeakOutput,
 } from '@/ai/flows/summarize-and-speak';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';

type Lesson = GenerateLessonOutput;
type Quiz = NonNullable<Lesson['slides'][0]['quiz']>;

function LessonLoadingSkeleton({ countdown }: { countdown: number }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">
          Generating Your Lesson...
        </h2>
        <p className="text-muted-foreground">
          {countdown > 0
            ? `Estimated time remaining: ${countdown} seconds`
            : 'This is taking longer than expected, please bear with us...'}
        </p>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
    </div>
  );
}


function MultiSelectQuiz({
  quiz,
  onFinish,
}: {
  quiz: Extract<Quiz, { quizType: 'multiple-choice' }>;
  onFinish: () => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setSelectedAnswers((prev) =>
      checked ? [...prev, option] : prev.filter((o) => o !== option)
    );
  };

  const checkAnswers = () => {
    setIsAnswered(true);
  };
  
  const correctAnswers = Array.isArray(quiz.answer) ? quiz.answer : [quiz.answer];
  
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option) => {
          const isSelected = selectedAnswers.includes(option);
          const isCorrect = correctAnswers.includes(option);

          return (
            <Label
              key={option}
              className={cn(
                'flex items-center space-x-3 p-3 border rounded-md transition-colors',
                'cursor-pointer hover:bg-muted',
                isAnswered && isCorrect && 'border-green-500 bg-green-100 dark:bg-green-900/30',
                isAnswered && !isCorrect && isSelected && 'border-red-500 bg-red-100 dark:bg-red-900/30'
              )}
            >
              <Checkbox
                id={option}
                checked={isSelected}
                onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                disabled={isAnswered}
              />
              <span>{option}</span>
              {isAnswered && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
              {isAnswered && !isCorrect && isSelected && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
            </Label>
          );
        })}
      </div>
       <div className="mt-4 flex justify-end">
        {isAnswered ? (
          <Button onClick={onFinish}>Continue</Button>
        ) : (
          <Button onClick={checkAnswers} disabled={selectedAnswers.length === 0}>
            Check Answers
          </Button>
        )}
      </div>
    </div>
  );
}

function SingleSelectQuiz({
  quiz,
  onFinish,
}: {
  quiz: Extract<Quiz, { quizType: 'multiple-choice' }>;
  onFinish: () => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isCorrect = selectedAnswer === quiz.answer;

  const handleCheckAnswer = () => {
    setIsAnswered(true);
  };

  return (
     <div className="space-y-4">
      <p className="text-muted-foreground mb-4">{quiz.question}</p>
      <RadioGroup
        value={selectedAnswer ?? ''}
        onValueChange={setSelectedAnswer}
        disabled={isAnswered}
        className="space-y-2"
      >
        {quiz.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isTheCorrectAnswer = quiz.answer === option;
          return (
            <Label
              key={option}
              className={cn(
                'flex items-center space-x-3 p-3 border rounded-md transition-colors',
                'cursor-pointer hover:bg-muted',
                isAnswered &&
                  isTheCorrectAnswer &&
                  'border-green-500 bg-green-100 dark:bg-green-900/30',
                isAnswered &&
                  !isTheCorrectAnswer &&
                  isSelected &&
                  'border-red-500 bg-red-100 dark:bg-red-900/30'
              )}
            >
              <RadioGroupItem value={option} id={option} />
              <span>{option}</span>
              {isAnswered && isTheCorrectAnswer && (
                <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
              )}
              {isAnswered && !isTheCorrectAnswer && isSelected && (
                <XCircle className="ml-auto h-5 w-5 text-red-600" />
              )}
            </Label>
          );
        })}
      </RadioGroup>
      <div className="mt-4 flex justify-end">
        {isAnswered ? (
          <Button onClick={onFinish}>Continue</Button>
        ) : (
          <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}

function WrittenQuestionLessonQuiz({
  quiz,
  onFinish,
}: {
  quiz: Extract<Quiz, { quizType: 'written-question' }>;
  onFinish: () => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnswered(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-muted-foreground mb-4">{quiz.question} <span className="font-bold">[{quiz.marks} marks]</span></p>
      <Textarea
        placeholder="Your answer..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        rows={4}
        disabled={isAnswered}
      />
      <div className="mt-4 flex justify-end">
        {isAnswered ? (
           <Button onClick={onFinish}>Continue</Button>
        ) : (
          <Button type="submit" disabled={!userAnswer}>Check Answer</Button>
        )}
      </div>
       {isAnswered && (
          <Alert className="mt-4">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Model Answer</AlertTitle>
            <AlertDescription>{quiz.answer}</AlertDescription>
          </Alert>
        )}
    </form>
  )
}

function FillInTheBlanksLessonQuiz({
  quiz,
  onFinish,
}: {
  quiz: Extract<Quiz, { quizType: 'fill-in-the-blanks' }>;
  onFinish: () => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  const isAnswerCorrect = (userAns: string, correctAns: string) => {
    const cleanUser = userAns.trim().toLowerCase();
    const cleanCorrect = correctAns.trim().toLowerCase();
    return cleanUser === cleanCorrect || `${cleanUser}s` === cleanCorrect || cleanUser === `${cleanCorrect}s`;
  }
  
  const correct = isAnswerCorrect(userAnswer, quiz.answer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnswered(true);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
        {quiz.sentence.split('______').map((part, i, arr) => (
          <span key={i} className="flex items-center gap-2">
            <span>{part}</span>
            {i < arr.length - 1 && (
              <Input
                type="text"
                className="h-8 w-32"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isAnswered}
              />
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        {isAnswered ? (
          <Button onClick={onFinish}>Continue</Button>
        ) : (
          <Button type="submit" disabled={!userAnswer}>Check Answer</Button>
        )}
      </div>
      {isAnswered && (
        <Alert className={cn("mt-4", correct ? "border-green-500" : "border-red-500")}>
          {correct ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>{correct ? "Correct!" : "Incorrect"}</AlertTitle>
          <AlertDescription>The correct answer was: <strong>{quiz.answer}</strong></AlertDescription>
        </Alert>
      )}
    </form>
  );
}


function LessonQuiz({
  quiz,
  onFinish,
}: {
  quiz: Quiz;
  onFinish: () => void;
}) {

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-bold text-lg mb-2 flex items-center">
        <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
        Check your understanding
      </h3>
      
      {quiz.quizType === 'multiple-choice' && (
        Array.isArray(quiz.answer) ? 
          <MultiSelectQuiz quiz={quiz} onFinish={onFinish} /> :
          <SingleSelectQuiz quiz={quiz} onFinish={onFinish} />
      )}
      {quiz.quizType === 'written-question' && (
        <WrittenQuestionLessonQuiz quiz={quiz} onFinish={onFinish} />
      )}
      {quiz.quizType === 'fill-in-the-blanks' && (
        <FillInTheBlanksLessonQuiz quiz={quiz} onFinish={onFinish} />
      )}
    </div>
  );
}

function PodcastPlayer({ fullLessonText, topicTitle }: { fullLessonText: string, topicTitle: string }) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleGenerateAudio = async () => {
    setIsLoading(true);
    try {
      const result: SummarizeAndSpeakOutput = await summarizeAndSpeak({
        content: fullLessonText,
        topic: topicTitle,
      });
      setAudioSrc(result.audio);
    } catch (error) {
      console.error("Podcast generation failed:", error);
      toast({
        variant: 'destructive',
        title: 'Podcast Generation Failed',
        description: 'There was an error creating the audio summary.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      if (!audioSrc) {
        handleGenerateAudio();
      } else {
        audioRef.current?.play();
      }
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSkip = (amount: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  }

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioSrc && audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  }, [audioSrc]);

  useEffect(() => {
    const audioElement = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    if (audioElement) {
      audioElement.addEventListener('play', onPlay);
      audioElement.addEventListener('pause', onPause);
      audioElement.addEventListener('ended', onEnded);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audioElement.removeEventListener('play', onPlay);
        audioElement.removeEventListener('pause', onPause);
        audioElement.removeEventListener('ended', onEnded);
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audioRef, audioSrc]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="border-t mt-6 pt-6">
        <h3 className="font-bold text-lg mb-2 flex items-center">
            <Mic className="mr-2 h-5 w-5 text-primary" />
            Lesson Podcast
        </h3>
        <p className="text-muted-foreground text-sm mb-4">Listen to a summary of the entire lesson.</p>
        
        {isLoading ? (
            <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm text-muted-foreground">Generating audio summary...</p>
            </div>
        ) : !audioSrc ? (
            <Button onClick={handleGenerateAudio}>
                <Play className="mr-2 h-4 w-4" />
                Generate and Play
            </Button>
        ) : (
            <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleSkip(-10)}>
                        <Rewind className="h-6 w-6" />
                    </Button>
                     <Button variant="outline" size="icon" className="w-12 h-12" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleSkip(10)}>
                        <FastForward className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTime(progress)}</span>
                    <Slider 
                        value={[progress]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        )}
        
        {audioSrc && <audio ref={audioRef} src={audioSrc} />}
    </div>
  );
}


export default function LearnPage() {
  const { topic: topicId } = useParams() as { topic: string };

  const allTopics = subjects
    .flatMap((s) => s.topics)
    .concat(subjects.flatMap((s) => s.practicals || []));
  const topic =
    allTopics.find((t) => t.id === topicId) ||
    ({ title: 'Selected Topic', id: topicId } as (typeof allTopics)[0]);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    if (!topicId) return;

    setIsLoading(true);
    setLesson(null);
    setCurrentSlideIndex(0);
    setCountdown(30);

    generateLesson({ topic: topic.title })
      .then((result) => {
        setLesson(result as Lesson);
      })
      .catch((err) => {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Error Generating Lesson',
          description: 'Could not generate a lesson for this topic.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [topicId, topic.title, toast]);

  useEffect(() => {
    if (isLoading && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => Math.max(0, prevCountdown - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, countdown]);
  
  const totalContentSlides = (lesson?.slides?.length ?? 0);
  const hasObjectives = lesson && lesson.objectives && lesson.objectives.length > 0;
  const hasIntroduction = lesson && lesson.introduction;
  const hasSummary = lesson && lesson.summary;

  let slideOffset = 0;
  if (hasObjectives) slideOffset++;
  if (hasIntroduction) slideOffset++;

  const contentSlideIndex = currentSlideIndex - slideOffset;
  const currentSlideData = lesson?.slides[contentSlideIndex];
  
  const totalSlides =
    (hasObjectives ? 1 : 0) +
    (hasIntroduction ? 1 : 0) +
    totalContentSlides +
    (hasSummary ? 1 : 0) +
    1; // End card


  const nextSlide = () => {
    if (currentSlideData?.quiz && !showQuiz) {
        setShowQuiz(true);
        return;
    }
    setShowQuiz(false);
    setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setShowQuiz(false);
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };
  
  const handleQuizFinish = () => {
      setShowQuiz(false);
      setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  }
  
  const getFullLessonText = () => {
    if (!lesson) return '';
    let fullText = '';
    fullText += `Lesson: ${lesson.title}. `;
    if (lesson.objectives) {
      fullText += `Learning Objectives: ${lesson.objectives.join('. ')}. `;
    }
    if (lesson.introduction) {
      fullText += `Introduction: ${lesson.introduction}. `;
    }
    lesson.slides.forEach(slide => {
      fullText += `${slide.title}. ${slide.content}. `;
    });
    if (lesson.summary) {
      fullText += `Summary: ${lesson.summary}.`;
    }
    return fullText.replace(/<[^>]+>/g, '');
  }


  const renderContent = () => {
    if (!lesson) return null;

    // Objectives
    if (currentSlideIndex === 0 && hasObjectives) {
      const text = `Learning Objectives: ${lesson.objectives.join('. ')}`;
      return (
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>
              By the end of this lesson, you will be able to:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {lesson.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    }
    
    // Introduction
    if (currentSlideIndex === (hasObjectives ? 1 : 0) && hasIntroduction) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.introduction }}
            />
            <PodcastPlayer fullLessonText={getFullLessonText()} topicTitle={lesson.title} />
          </CardContent>
        </Card>
      );
    }

    // Content Slides
    if (contentSlideIndex >= 0 && contentSlideIndex < lesson.slides.length) {
      const slide = lesson.slides[contentSlideIndex];
      const quiz = slide.quiz;
      
      return (
        <Card>
          <CardHeader>
            <CardTitle>{slide.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: slide.content }}
            />
            
            <div className="flex flex-wrap gap-4">
              {slide.videoUrl && (
                  <a href={slide.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                          <Video className="mr-2 h-4 w-4" />
                          Watch a video on this topic
                      </Button>
                  </a>
              )}
            </div>
            
            {quiz && !showQuiz && (
                <div className="flex justify-center my-4 pt-4 border-t">
                  <Button onClick={() => setShowQuiz(true)}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Test my knowledge
                  </Button>
                </div>
            )}
            {quiz && showQuiz && (
              <LessonQuiz quiz={quiz} onFinish={handleQuizFinish} />
            )}
          </CardContent>
        </Card>
      );
    }
    
    // Summary
    const summarySlideIndex = slideOffset + lesson.slides.length;
     if (currentSlideIndex === summarySlideIndex && hasSummary) {
       return (
         <Card>
          <CardHeader>
            <CardTitle>Lesson Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.summary }}
            />
          </CardContent>
        </Card>
       )
     }
     
     // End Card
     const endCardIndex = summarySlideIndex + (hasSummary ? 1 : 0);
     if (currentSlideIndex === endCardIndex) {
        return (
             <Card className="text-center p-8">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="mt-4 text-2xl">Lesson Complete!</CardTitle>
                    <CardDescription>You've finished the lesson on {lesson.title}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-4 mt-6 justify-center">
                        <Button onClick={() => setCurrentSlideIndex(0)}>
                           Review Lesson
                        </Button>
                        <Link href="/learn" passHref>
                           <Button variant="outline">Choose Another Topic</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
     }


    return null;
  };

  const isLastSlide = currentSlideIndex >= totalSlides - 2;

  return (
    <>
      <PageHeader
        title={lesson?.title || 'Loading Lesson...'}
        description={`An AI-powered lesson on ${topic.title}`}
      />
      {isLoading ? (
        <LessonLoadingSkeleton countdown={countdown} />
      ) : lesson ? (
        <div>
          <div className="mb-4">{renderContent()}</div>
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              {currentSlideIndex + 1} / {totalSlides -1}
            </p>
            <Button
              variant="default"
              onClick={nextSlide}
              disabled={isLastSlide || (currentSlideData?.quiz && !showQuiz)}
            >
              {currentSlideIndex === totalSlides - 2 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Could not load lesson. Please try again.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
