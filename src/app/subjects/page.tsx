
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { subjects } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { ArrowRight } from 'lucide-react';

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        title="Browse Topics"
        description="Choose a topic area to start your revision."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <Link href={`/subjects/${subject.id}`} key={subject.id} className="group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 flex flex-col">
                <CardHeader className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                     <Icon className="size-10 text-primary" />
                     <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-2xl font-headline mb-2">{subject.name}</CardTitle>
                  <CardDescription className="flex-grow">{subject.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
