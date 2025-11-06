
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subjects } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudyLobbyPage() {
  return (
    <>
      <PageHeader
        title="Study a Topic"
        description="Select a topic to start an interactive AI-powered lesson."
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
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subject.topics.map(
                (topic) => (
                  <Link href={`/study/${topic.id}`} passHref key={topic.id}>
                    <Button
                      variant="secondary"
                      className="w-full h-full justify-start text-left py-3 flex items-start"
                    >
                      <span className="font-bold mr-2">
                        {topic.title.split(':')[0]}:
                      </span>
                      <span className="flex-1 whitespace-normal">
                        {topic.title.substring(topic.title.indexOf(':') + 2)}
                      </span>
                    </Button>
                  </Link>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
