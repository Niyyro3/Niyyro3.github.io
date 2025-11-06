
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Award,
  RefreshCw,
  CheckCircle,
  XCircle,
  PencilLine,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generatePracticeQuestions,
  type GeneratePracticeQuestionsOutput,
} from '@/ai/flows/generate-practice-questions';
import {
  gradeWrittenAnswer,
  type GradeWrittenAnswerOutput,
} from '@/ai/flows/grade-written-answer';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { subjects } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type AIGeneratedQuestion = GeneratePracticeQuestionsOutput['questions'][0];

function PracticeQuestion({
  question,
  onAnswered,
}: {
  question: AIGeneratedQuestion;
  onAnswered: (marksAwarded: number) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<GradeWrittenAnswerOutput | null>(
    null
  );

  useEffect(() => {
    setSelectedAnswer('');
    setIsAnswered(false);
    setFeedback(null);
    setIsGrading(false);
  }, [question]);

  const handleCheckAnswer = async () => {
    setIsAnswered(true);

    if (question.quizType === 'multiple-choice') {
      const isCorrect = selectedAnswer === question.answer;
      onAnswered(isCorrect ? 1 : 0);
    } else if (question.quizType === 'fill-in-the-gaps') {
      const cleanUser = selectedAnswer.trim().toLowerCase();
      const cleanCorrect = question.answer.trim().toLowerCase();
      const isCorrect = cleanUser === cleanCorrect;
      onAnswered(isCorrect ? 1 : 0);
    } else if (question.quizType === 'written-question') {
      setIsGrading(true);
      try {
        const result = await gradeWrittenAnswer({
          question: question.question,
          marks: question.marks,
          userAnswer: selectedAnswer,
          markScheme: question.answer,
        });
        setFeedback(result);
        onAnswered(result.marksAwarded);
      } catch (error) {
        console.error('AI grading failed', error);
        // If AI grading fails, give 0 marks but allow to continue
        onAnswered(0);
      } finally {
        setIsGrading(false);
      }
    }
  };

  const getCorrectAnswer = () => {
    if (
      question.quizType === 'multiple-choice' ||
      question.quizType === 'fill-in-the-gaps'
    ) {
      return question.answer;
    }
     if (question.quizType === 'written-question') {
        return question.answer;
    }
    return '';
  };

  const isCorrect = () => {
    if (!isAnswered) return false;
    if (question.quizType === 'fill-in-the-gaps') {
      const cleanUser = selectedAnswer.trim().toLowerCase();
      const cleanCorrect = question.answer.trim().toLowerCase();
      return cleanUser === cleanCorrect;
    }
    return selectedAnswer === getCorrectAnswer();
  };

  const renderQuestionType = () => {
    switch (question.quizType) {
      case 'multiple-choice':
        return (
          <>
            <p className="text-lg font-semibold">{question.question}</p>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              disabled={isAnswered}
            >
              {question.options.map((option) => {
                const isTheCorrectAnswer = question.answer === option;
                const isSelected = selectedAnswer === option;
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
                    <RadioGroupItem value={option} />
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
          </>
        );
      case 'written-question':
        return (
          <div className="space-y-4">
            <p className="text-lg font-semibold">
              {question.question}{' '}
              <span className="font-bold text-muted-foreground">
                [{question.marks} marks]
              </span>
            </p>
            <Textarea
              placeholder="Your answer..."
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              rows={6}
              disabled={isAnswered}
            />
            {isGrading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>AI is marking your answer...</p>
              </div>
            )}
            {feedback ? (
              <Card className="mt-4 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PencilLine className="h-5 w-5 mr-2 text-primary" />
                    AI Feedback: {feedback.marksAwarded} / {question.marks}{' '}
                    marks
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: feedback.feedback }}
                ></CardContent>
              </Card>
            ) : isAnswered && (
                <Alert>
                    <AlertTitle>Model Answer</AlertTitle>
                    <AlertDescription>{getCorrectAnswer()}</AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'fill-in-the-gaps':
        const isCorrectGap = isCorrect();
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-lg">
              {question.sentence.split('______').map((part, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{part}</span>
                  {i < arr.length - 1 && (
                    <Input
                      type="text"
                      className="h-8 w-32"
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      disabled={isAnswered}
                    />
                  )}
                </span>
              ))}
            </div>
            {isAnswered && (
              <Alert
                className={cn(
                  isCorrectGap ? 'border-green-500' : 'border-red-500'
                )}
              >
                {isCorrectGap ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>{isCorrectGap ? 'Correct!' : 'Incorrect'}</AlertTitle>
                <AlertDescription>
                  The correct answer was: <strong>{getCorrectAnswer()}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="space-y-4">
      {renderQuestionType()}
      <div className="flex justify-end">
        {!isAnswered && (
          <Button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer || isGrading}
          >
            {isGrading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Check Answer'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PracticeExamPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();

  const startExam = async () => {
    if (selectedTopics.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No topics selected',
        description: 'Please select at least one topic to start the exam.',
      });
      return;
    }

    setIsLoading(true);
    setIsStarted(true);
    try {
      const result = await generatePracticeQuestions({
        topic: selectedTopics.join(', '),
        difficulty: 'medium', // This could be a user option in the future
        performanceSummary: `The user wants a practice exam based on these specific topics: ${selectedTopics.join(', ')}.`,
        questionCount: 10,
      });
      setQuestions(result.questions);
      setTotalMarks(
        result.questions.reduce(
          (acc, q) => acc + (q.quizType === 'written-question' ? q.marks : 1),
          0
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating exam',
        description: 'Could not create a practice exam. Please try again.',
      });
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleAnswered = (marksAwarded: number) => {
    setScore((prev) => prev + marksAwarded);
    setIsAnswered(true);
  };

  const restartExam = () => {
    setIsFinished(false);
    setScore(0);
    setTotalMarks(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setIsStarted(false);
    setSelectedTopics([]);
  };

  const handleTopicChange = (topicTitle: string, checked: boolean) => {
    setSelectedTopics((prev) =>
      checked ? [...prev, topicTitle] : prev.filter((t) => t !== topicTitle)
    );
  };

  const renderContent = () => {
    if (isLoading && !isStarted) {
      return (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      );
    }

    if (!isStarted) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Practice Exam Setup</CardTitle>
            <CardDescription>
              Choose your topics to generate a personalized exam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Select Topics</h3>
                <Accordion type="multiple" className="w-full">
                    {subjects.map(subject => (
                        <AccordionItem value={subject.id} key={subject.id}>
                            <AccordionTrigger className="font-bold">{subject.name}</AccordionTrigger>
                            <AccordionContent>
                               <div className="space-y-2 pl-4">
                                {subject.topics.map(topic => (
                                    <div key={topic.id} className="space-y-2">
                                        <Label className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                                            <Checkbox 
                                                id={topic.id}
                                                checked={selectedTopics.includes(topic.title)}
                                                onCheckedChange={(checked) => handleTopicChange(topic.title, !!checked)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <span className="font-semibold text-sm">{topic.title}</span>
                                            </div>
                                        </Label>
                                        {topic.subTopics && (
                                            <div className="pl-6 space-y-2">
                                                {topic.subTopics.map(subTopic => (
                                                     <Label key={subTopic.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                        <Checkbox
                                                            id={subTopic.id}
                                                            checked={selectedTopics.includes(subTopic.title)}
                                                            onCheckedChange={(checked) => handleTopicChange(subTopic.title, !!checked)}
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <span className="font-medium text-xs">{subTopic.title}</span>
                                                        </div>
                                                    </Label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <Button onClick={startExam} disabled={selectedTopics.length === 0}>
              Start Exam
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (isLoading && isStarted) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Generating Your Exam Paper...</CardTitle>
            <CardDescription>
              The AI is creating a personalized paper just for you. This might take a moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isFinished) {
      const percentage =
        totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <Award className="mx-auto h-16 w-16 text-yellow-500" />
              <CardTitle className="mt-4 text-2xl">Exam Complete!</CardTitle>
              <CardDescription>
                Great work tackling your selected topics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {score} / {totalMarks}
              </p>
              <p className="text-lg text-muted-foreground mt-1">
                That's {percentage}%
              </p>
              <div className="flex gap-4 mt-6 justify-center">
                <Button onClick={restartExam}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Another Exam
                </Button>
                <Link href="/dashboard" passHref>
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      return (
        <>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="mb-4"
          />
          <Card>
            <CardHeader>
              <CardTitle>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <CardDescription className="text-sm pt-2 capitalize font-semibold text-primary">
                {currentQuestion.quizType.replace(/-/g, ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PracticeQuestion
                key={currentQuestionIndex}
                question={currentQuestion}
                onAnswered={handleAnswered}
              />
              {isAnswered && (
                <div className="flex justify-end mt-4">
                  <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex === questions.length - 1
                      ? 'Finish Exam'
                      : 'Next Question'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <PageHeader
        title="Practice Exam"
        description="An AI-generated mock exam focused on your chosen topics."
      />
      {renderContent()}
    </>
  );
}
