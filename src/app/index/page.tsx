
'use client';

import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { subjects } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

type Topic = (typeof subjects)[0]['topics'][0];

function TopicSummaryContent({ topic }: { topic: Topic }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: topic.content }} />
    </div>
  );
}

export default function IndexPage() {
  return (
    <>
      <PageHeader
        title="Index of Key Information"
        description="A complete reference guide with AI-generated summaries of all key people, dates, and events for each topic."
      />
      <Card>
        <CardContent className="p-4">
          <Accordion type="multiple" className="w-full">
            {subjects.map((subject) => (
              <AccordionItem value={subject.id} key={subject.id}>
                <AccordionTrigger className="text-xl font-bold hover:no-underline">
                  <div className="flex items-center gap-3">
                    <subject.icon className="h-6 w-6 text-primary" />
                    {subject.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="w-full">
                    {subject.topics.map((topic) => (
                      <AccordionItem value={topic.id} key={topic.id}>
                        <AccordionTrigger className="font-semibold">{topic.title}</AccordionTrigger>
                        <AccordionContent>
                          <TopicSummaryContent topic={topic} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {subject.practicals?.map((topic) => (
                      <AccordionItem value={topic.id} key={topic.id}>
                        <AccordionTrigger className="font-semibold">{topic.title}</AccordionTrigger>
                        <AccordionContent>
                          <TopicSummaryContent topic={topic} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
