
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { subjects } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function QuizLobbyPage() {
  
  return (
    <>
      <PageHeader
        title="Quiz Lobby"
        description="Select a topic to test your knowledge."
      />
      <div className="grid gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <subject.icon className="mr-3 h-6 w-6" />
                {subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {subject.topics.map((topic) => (
                   <AccordionItem value={topic.id} key={topic.id}>
                    <AccordionTrigger className="font-bold hover:no-underline">{topic.title}</AccordionTrigger>
                     <AccordionContent>
                       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                        <Link href={`/quiz/${topic.id}`} passHref key={topic.id}>
                            <Button variant="secondary" className="w-full justify-start text-left h-auto py-3 font-semibold border-2 border-primary/50">
                                General Quiz for {topic.title.split(':')[0]}
                            </Button>
                        </Link>
                        {topic.subTopics?.map((subTopic) => (
                           <Link href={`/quiz/${subTopic.id}`} passHref key={subTopic.id}>
                            <Button variant="secondary" className="w-full justify-start text-left h-auto py-3">
                               <span className="flex-1 whitespace-normal">{subTopic.title}</span>
                            </Button>
                          </Link>
                        ))}
                      </div>
                     </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
