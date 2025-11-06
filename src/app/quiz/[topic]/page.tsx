
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { quizData, allQuestions, subjects } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Award, RefreshCw, PencilLine, ListChecks, Loader2, AlignLeft, Sparkles, Puzzle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { generateWrittenQuestion, type GenerateWrittenQuestionOutput } from '@/ai/flows/generate-written-question';
import { generateClozeTest, type GenerateClozeTestOutput } from '@/ai/flows/generate-cloze-test';
import { explainExamQuestion, type ExplainExamQuestionOutput } from '@/ai/flows/explain-exam-question';
import { gradeWrittenAnswer, type GradeWrittenAnswerOutput } from '@/ai/flows/grade-written-answer';
import { generateMatchingQuiz, type GenerateMatchingQuizOutput } from '@/ai/flows/generate-matching-quiz';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type QuizQuestions = typeof allQuestions;
type QuizQuestion = QuizQuestions[0];
type QuizMode = 'multiple-choice' | 'exam-question' | 'fill-in-the-gaps' | 'matching-pairs' | null;

function addWeakTopic(topicId: string) {
  const storedTopics = localStorage.getItem('weakTopics');
  let weakTopics: string[] = storedTopics ? JSON.parse(storedTopics) : [];
  if (!weakTopics.includes(topicId)) {
    weakTopics.push(topicId);
    localStorage.setItem('weakTopics', JSON.stringify(weakTopics));
  }
}

function MultipleChoiceQuiz({ questions, topicId, topicTitle }: { questions: QuizQuestions, topicId: string, topicTitle: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [currentQuestion.answer];
  const isMultiSelect = correctAnswers.length > 1;
  
  const handleSelectionChange = (value: string) => {
    if (isMultiSelect) {
        setSelectedAnswers(prev => 
            prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
        );
    } else {
        setSelectedAnswers([value]);
    }
  };

  const handleNext = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      const sortedSelected = [...selectedAnswers].sort();
      const sortedCorrect = [...correctAnswers].sort();
      if (JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect)) {
        setScore(score + 1);
      } else {
        addWeakTopic(topicId);
      }
    } else {
      setIsAnswered(false);
      setSelectedAnswers([]);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }

  if (isFinished) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Award className="mx-auto h-16 w-16 text-yellow-500"/>
                    <CardTitle className="mt-4 text-2xl">Quiz Complete!</CardTitle>
                    <CardDescription>You've finished the {topicTitle} quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{score} / {questions.length}</p>
                    <p className="text-lg text-muted-foreground mt-1">That's {Math.round((score / questions.length) * 100)}%</p>
                    <div className="flex gap-4 mt-6 justify-center">
                        <Button onClick={restartQuiz}>
                           <RefreshCw className="mr-2 h-4 w-4"/>
                           Try Again
                        </Button>
                        <Link href="/quiz" passHref>
                           <Button variant="outline">Choose Topic</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
          {isMultiSelect && <CardDescription className="text-sm text-primary font-medium">This question may have more than one answer.</CardDescription>}
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              {(isMultiSelect ? currentQuestion.options : currentQuestion.options.map(opt => ({ id: opt, label: opt }))).map((option) => {
                  const id = typeof option === 'string' ? option : option.id;
                  const label = typeof option === 'string' ? option : option.label;
                  const isSelected = selectedAnswers.includes(id);
                  const isCorrect = correctAnswers.includes(id);
                  return (
                      <Label
                      key={id}
                      className={cn(
                          "flex items-center space-x-3 p-4 border rounded-md transition-colors",
                          "cursor-pointer hover:bg-muted",
                          isAnswered && isCorrect && "border-green-500 bg-green-100 dark:bg-green-900/30",
                          isAnswered && !isCorrect && isSelected && "border-red-500 bg-red-100 dark:bg-red-900/30"
                      )}
                      >
                      {isMultiSelect ? (
                         <Checkbox 
                           checked={isSelected} 
                           onCheckedChange={() => handleSelectionChange(id)}
                           disabled={isAnswered}
                         />
                      ) : (
                         <RadioGroup
                            value={selectedAnswers[0]}
                            onValueChange={handleSelectionChange}
                            className="flex items-center"
                          >
                           <RadioGroupItem 
                             value={id}
                             disabled={isAnswered}
                           />
                         </RadioGroup>
                      )}
                      <span>{label}</span>
                      {isAnswered && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-600"/>}
                      {isAnswered && !isCorrect && isSelected && <XCircle className="ml-auto h-5 w-5 text-red-600"/>}
                      </Label>
                  );
              })}
            </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} disabled={selectedAnswers.length === 0}>
              {isAnswered ? 'Next' : 'Check Answer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}


function ExamQuestionQuiz({ topicTitle }: { topicTitle: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [questionData, setQuestionData] = useState<GenerateWrittenQuestionOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GradeWrittenAnswerOutput | null>(null);
  const [isGettingHelp, setIsGettingHelp] = useState(false);
  const [helpExplanation, setHelpExplanation] = useState<string | null>(null);
  const { topic: topicId } = useParams<{topic: string}>();

  const { toast } = useToast();

  const fetchQuestion = async () => {
    setIsLoading(true);
    setQuestionData(null);
    setFeedback(null);
    setUserAnswer('');
    setHelpExplanation(null);
    try {
      const marks = [2, 4, 6][Math.floor(Math.random() * 3)];
      const result = await generateWrittenQuestion({ topic: topicTitle, marks });
      setQuestionData(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating question',
        description: 'Could not fetch a new question. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer || !questionData) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await gradeWrittenAnswer({
        question: questionData.question,
        marks: questionData.marks,
        userAnswer: userAnswer,
        markScheme: questionData.explanation, // Using explanation as the mark scheme
      });
      setFeedback(result);
      if (result.marksAwarded < questionData.marks) {
        addWeakTopic(topicId);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error checking answer',
        description: 'There was a problem evaluating your answer. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHelp = async () => {
    if (!questionData) return;
    setIsGettingHelp(true);
    setHelpExplanation(null);
    try {
      const result: ExplainExamQuestionOutput = await explainExamQuestion({ question: questionData.question, topic: topicTitle });
      setHelpExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error getting help',
        description: 'Could not get an explanation. Please try again.',
      });
    } finally {
      setIsGettingHelp(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam-Style Question</CardTitle>
        <CardDescription>An AI-generated question. Type your answer in the box below.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : questionData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-lg font-semibold">{questionData.question}</p>
            <p className="text-sm font-bold text-muted-foreground">[{questionData.marks} marks]</p>
            <Textarea
              placeholder="Your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={6}
              disabled={isSubmitting || !!feedback}
            />
             <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <Button type="submit" disabled={!userAnswer || isSubmitting || !!feedback}>
                  {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mark my Answer
                </Button>
                <Button variant="outline" onClick={handleGetHelp} disabled={isGettingHelp || !!feedback}>
                  {isGettingHelp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Get Help
                </Button>
              </div>
              {feedback && (
                 <Button onClick={fetchQuestion} variant="secondary">
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    Next Question
                 </Button>
              )}
            </div>

            {helpExplanation && !feedback && (
              <Alert className="mt-4">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>AI Helper</AlertTitle>
                <AlertDescription>
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: helpExplanation.replace(/\n/g, '<br />') }} />
                </AlertDescription>
              </Alert>
            )}

            {feedback && (
               <Card className="mt-4 border-border">
                  <CardHeader>
                      <CardTitle className="flex items-center">
                        <PencilLine className="h-5 w-5 mr-2 text-primary"/>
                        AI Feedback: {feedback.marksAwarded} / {questionData.marks} marks
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert"
                     dangerouslySetInnerHTML={{ __html: feedback.feedback }}
                  >
                  </CardContent>
              </Card>
            )}
          </form>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>Could not load a question.</p>
            <Button onClick={fetchQuestion} variant="link">Try again</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FillInTheGapsQuiz({ topicTitle, topicId }: { topicTitle: string, topicId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [clozeData, setClozeData] = useState<GenerateClozeTestOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const fetchClozeTest = async () => {
    setIsLoading(true);
    setClozeData(null);
    setIsFinished(false);
    setScore(0);
    try {
      const result = await generateClozeTest({ topic: topicTitle });
      setClozeData(result);
      setUserAnswers(new Array(result.questions.length).fill(''));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating quiz',
        description: 'Could not fetch a new quiz. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClozeTest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };
  
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string) => {
    const cleanUserAnswer = userAnswer.trim().toLowerCase();
    const cleanCorrectAnswer = correctAnswer.trim().toLowerCase();
    
    // Exact match
    if (cleanUserAnswer === cleanCorrectAnswer) return true;
    
    // Plural/singular match (simple version)
    if (`${cleanUserAnswer}s` === cleanCorrectAnswer) return true;
    if (cleanUserAnswer === `${cleanCorrectAnswer}s`) return true;
    if (cleanUserAnswer.endsWith('s') && cleanUserAnswer.slice(0, -1) === cleanCorrectAnswer) return true;
    if (cleanCorrectAnswer.endsWith('s') && cleanCorrectAnswer.slice(0, -1) === cleanUserAnswer) return true;
    
    return false;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clozeData) return;
    let currentScore = 0;
    clozeData.questions.forEach((q, i) => {
      if (isAnswerCorrect(userAnswers[i], q.answer)) {
        currentScore++;
      } else {
        addWeakTopic(topicId);
      }
    });
    setScore(currentScore);
    setIsFinished(true);
  };

  if (isFinished) {
     return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Award className="mx-auto h-16 w-16 text-yellow-500"/>
                    <CardTitle className="mt-4 text-2xl">Quiz Complete!</CardTitle>
                    <CardDescription>You've finished the {clozeData?.title} quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{score} / {clozeData?.questions.length}</p>
                    <p className="text-lg text-muted-foreground mt-1">That's {clozeData ? Math.round((score / clozeData.questions.length) * 100) : 0}%</p>
                    <div className="mt-4 space-y-2 text-left">
                        {clozeData?.questions.map((q, i) => (
                           <p key={i} className={cn(isAnswerCorrect(userAnswers[i], q.answer) ? "text-green-600" : "text-red-600")}>
                              {i+1}. The answer was: <strong>{q.answer}</strong>
                           </p>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-6 justify-center">
                        <Button onClick={fetchClozeTest}>
                           <RefreshCw className="mr-2 h-4 w-4"/>
                           Try Again
                        </Button>
                        <Link href="/quiz" passHref>
                           <Button variant="outline">Choose Topic</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLoading ? <Skeleton className="h-8 w-2/3" /> : clozeData?.title}</CardTitle>
        <CardDescription>Fill in the missing words in the sentences below.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full"/>)}
          </div>
         ) : clozeData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
              {clozeData.questions.map((q, index) => (
                <div key={index} className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{index + 1}.</span>
                  {q.sentence.split('______').map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-2">
                       <span className="text-sm">{part}</span>
                       {i < arr.length - 1 && (
                         <Input
                           type="text"
                           className="h-8 w-32 text-sm"
                           value={userAnswers[index]}
                           onChange={(e) => handleAnswerChange(index, e.target.value)}
                         />
                       )}
                    </span>
                  ))}
                </div>
              ))}
              <Button type="submit">Check Answers</Button>
          </form>
         ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Could not load a quiz.</p>
              <Button onClick={fetchClozeTest} variant="link">Try again</Button>
            </div>
         )}
      </CardContent>
    </Card>
  )
}

// Utility function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

type Pair = GenerateMatchingQuizOutput['pairs'][0];

function MatchingPairsQuiz({ topicTitle, topicId }: { topicTitle: string, topicId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<GenerateMatchingQuizOutput | null>(null);
  const [items, setItems] = useState<Pair[]>([]);
  const [matches, setMatches] = useState<Pair[]>([]);
  const [selectedItem, setSelectedItem] = useState<Pair | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Pair | null>(null);
  const [correctlyMatchedIds, setCorrectlyMatchedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const result = await generateMatchingQuiz({ topic: topicTitle });
      setQuizData(result);
      setItems(shuffle([...result.pairs]));
      setMatches(shuffle([...result.pairs]));
      setCorrectlyMatchedIds([]);
      setIsFinished(false);
      setSelectedItem(null);
      setSelectedMatch(null);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error generating quiz' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedItem && selectedMatch) {
      if (selectedItem.id === selectedMatch.id) {
        // Correct match
        setCorrectlyMatchedIds(prev => [...prev, selectedItem.id]);
        if (correctlyMatchedIds.length + 1 === (quizData?.pairs.length || 0)) {
            setIsFinished(true);
        }
      } else {
        // Incorrect match
        addWeakTopic(topicId);
        toast({
          variant: 'destructive',
          title: 'Incorrect Match',
          duration: 2000,
        });
      }
      // Reset selection after a short delay
      setTimeout(() => {
        setSelectedItem(null);
        setSelectedMatch(null);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, selectedMatch]);

  const handleItemSelect = (item: Pair) => {
    if (correctlyMatchedIds.includes(item.id)) return;
    setSelectedItem(item);
  };

  const handleMatchSelect = (match: Pair) => {
    if (correctlyMatchedIds.includes(match.id)) return;
    setSelectedMatch(match);
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>;
  }

  if (isFinished) {
     return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Award className="mx-auto h-16 w-16 text-yellow-500"/>
                    <CardTitle className="mt-4 text-2xl">Quiz Complete!</CardTitle>
                    <CardDescription>You matched all the pairs for {quizData?.title}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">All {quizData?.pairs.length} pairs matched!</p>
                    <div className="flex gap-4 mt-6 justify-center">
                        <Button onClick={fetchQuiz}>
                           <RefreshCw className="mr-2 h-4 w-4"/>
                           Play Again
                        </Button>
                        <Link href="/quiz" passHref>
                           <Button variant="outline">Choose Topic</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quizData?.title}</CardTitle>
        <CardDescription>Match the items on the left with the correct options on the right.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {items.map(item => {
              const isCorrect = correctlyMatchedIds.includes(item.id);
              const isSelected = selectedItem?.id === item.id;
              return (
                <Button
                  key={`item-${item.id}`}
                  variant="outline"
                  className={cn(
                    "w-full h-auto min-h-12 justify-start text-left whitespace-normal",
                    isSelected && "ring-2 ring-primary",
                    isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500 text-muted-foreground",
                  )}
                  onClick={() => handleItemSelect(item)}
                  disabled={isCorrect}
                >
                  {item.item}
                </Button>
              );
            })}
          </div>
          <div className="space-y-2">
            {matches.map(match => {
                 const isCorrect = correctlyMatchedIds.includes(match.id);
                 const isSelected = selectedMatch?.id === match.id;
                 return (
                    <Button
                    key={`match-${match.id}`}
                    variant="outline"
                    className={cn(
                        "w-full h-auto min-h-12 justify-start text-left whitespace-normal",
                        isSelected && "ring-2 ring-primary",
                        isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-500 text-muted-foreground",
                    )}
                    onClick={() => handleMatchSelect(match)}
                    disabled={isCorrect}
                    >
                    {match.match}
                    </Button>
                );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



export default function QuizPage() {
  const { topic: topicId } = useParams<{topic: string}>();
  const [quizMode, setQuizMode] = useState<QuizMode>(null);

  const allSubjectsWithTopics = subjects.flatMap(s => s.topics.map(t => ({...t, subjectId: s.id})));
  const allSubTopics = allSubjectsWithTopics.flatMap(t => t.subTopics ? t.subTopics.map(st => ({...st, parentId: t.id })) : []);
  
  const currentTopicInfo = allSubjectsWithTopics.find(t => t.id === topicId) || allSubTopics.find(st => st.id === topicId);

  if (!currentTopicInfo) {
      notFound();
  }
  
  const { title: topicTitle } = currentTopicInfo;


  const getQuestionsForTopic = (selectedTopicId: string): QuizQuestion[] => {
    // Check if the selected ID is a main topic with sub-topics
    const mainTopic = subjects.flatMap(s => s.topics).find(t => t.id === selectedTopicId);
    if (mainTopic && mainTopic.subTopics) {
      // It's a main topic, so gather questions from all its sub-topics
      const subTopicIds = mainTopic.subTopics.map(st => st.id);
      return allQuestions.filter(q => subTopicIds.includes(q.topicId));
    }
    
    // Otherwise, it's a sub-topic, so just get questions for it
    return allQuestions.filter(q => q.topicId === selectedTopicId);
  }

  const questions = getQuestionsForTopic(topicId);

  if (quizMode === 'multiple-choice') {
    if (questions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Questions Available</CardTitle>
                    <CardDescription>Sorry, there are no multiple-choice questions for {topicTitle} yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setQuizMode(null)}>Choose Another Mode</Button>
                </CardContent>
            </Card>
        )
    }
    return <MultipleChoiceQuiz questions={questions} topicId={topicId} topicTitle={topicTitle} />;
  }

  const renderQuizContent = () => {
    switch (quizMode) {
      case 'exam-question':
        return <ExamQuestionQuiz topicTitle={topicTitle} />;
      case 'fill-in-the-gaps':
        return <FillInTheGapsQuiz topicTitle={topicTitle} topicId={topicId} />;
       case 'matching-pairs':
        return <MatchingPairsQuiz topicTitle={topicTitle} topicId={topicId} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Quiz Type</CardTitle>
              <CardDescription>How would you like to test your knowledge on {topicTitle}?</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-auto py-6" onClick={() => setQuizMode('multiple-choice')}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <ListChecks className="h-8 w-8" />
                  <span className="text-lg font-semibold">Multiple Choice</span>
                  <span className="text-sm text-muted-foreground">Answer questions from a set of options.</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-6" onClick={() => setQuizMode('exam-question')}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <PencilLine className="h-8 w-8" />
                  <span className="text-lg font-semibold">Exam Question</span>
                  <span className="text-sm text-muted-foreground">AI-generated exam-style questions.</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-6" onClick={() => setQuizMode('fill-in-the-gaps')}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <AlignLeft className="h-8 w-8" />
                  <span className="text-lg font-semibold">Fill in the Gaps</span>
                  <span className="text-sm text-muted-foreground">Fill in the missing keywords.</span>
                </div>
              </Button>
               <Button variant="outline" className="h-auto py-6" onClick={() => setQuizMode('matching-pairs')}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Puzzle className="h-8 w-8" />
                  <span className="text-lg font-semibold">Matching Pairs</span>
                  <span className="text-sm text-muted-foreground">Match terms to their definitions.</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      <PageHeader
        title={topicTitle}
        description={quizMode ? "Test your knowledge." : "Select a quiz mode to begin."}
      />
      {quizMode && (
        <Button variant="link" onClick={() => setQuizMode(null)} className="mb-4 pl-0">
          &larr; Back to quiz types
        </Button>
      )}
      {renderQuizContent()}
    </>
  );
}
