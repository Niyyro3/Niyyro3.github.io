
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { subjects } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

const features = [
    {
        title: 'Study a Topic',
        description: 'Interactive AI-powered lessons.',
        href: '/study',
        icon: Icons.study,
    },
    {
        title: 'Browse All Topics',
        description: 'Explore all units and key areas.',
        href: '/subjects',
        icon: Icons.subjects,
    },
    {
        title: 'Practice Exam',
        description: 'AI mock exams on your weak topics.',
        href: '/practice-exam',
        icon: Icons.practiceExam,
    },
    {
        title: 'Practice with Flashcards',
        description: 'Create and review flashcards.',
        href: '/flashcards',
        icon: Icons.flashcards,
    },
    {
        title: 'Test Your Knowledge',
        description: 'Take a quiz on any topic.',
        href: '/quiz',
        icon: Icons.quiz,
    },
    {
        title: 'AI Search',
        description: 'AI-powered definitions & diagrams.',
        href: '/search',
        icon: Icons.search,
    },
    {
        title: 'Past Papers',
        description: 'Access official Edexcel exam papers.',
        href: '/past-papers',
        icon: Icons.pastPapers,
    },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome Back, Student!"
        description="What would you like to do today?"
      />

       <div className="mb-6">
        <h3 className="text-xl font-bold tracking-tight mb-4">Choose a Topic to Study</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Link href={`/subjects/${subject.id}`} key={subject.id} className="group">
                <Card className="h-full transition-all duration-300 ease-in-out hover:bg-muted/50 hover:shadow-md flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                         <Icon className="size-8 text-primary mb-2" />
                         <CardTitle className="text-lg font-headline">{subject.name}</CardTitle>
                      </div>
                      <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
      
      <Separator className="my-8 h-[2px] bg-muted" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
            const Icon = feature.icon;
            return (
                <Link href={feature.href} key={feature.href} className="group">
                    <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 flex flex-col">
                        <CardHeader className="flex-grow">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1.5">
                                    <Icon className="size-8 text-primary mb-2" />
                                    <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </div>
                                <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            )
        })}
      </div>
    </>
  );
}
