
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { subjects } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const pastPaperLinks = [
  {
    subjectId: 'cold-war',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/history-2016.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExternal-assessments',
  },
  {
    subjectId: 'weimar-nazi-germany',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/history-2016.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExternal-assessments',
  },
  {
    subjectId: 'medicine-in-britain',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/history-2016.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExternal-assessments',
  },
   {
    subjectId: 'anglo-saxon-norman-england',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/history-2016.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExternal-assessments',
  },
];

export default function PastPapersPage() {
  return (
    <>
      <PageHeader
        title="Past Papers"
        description="Access past exam papers from Edexcel to test your knowledge."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pastPaperLinks.map((paperLink) => {
          const subject = subjects.find((s) => s.id === paperLink.subjectId);
          if (!subject) return null;
          const Icon = subject.icon;
          return (
            <Card key={subject.id} className="flex flex-col">
              <CardHeader>
                <Icon className="size-10 text-primary mb-4" />
                <CardTitle className="text-lg font-headline">
                  {subject.name}
                </CardTitle>
                <CardDescription>
                  Official Edexcel past papers and mark schemes.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Link href={paperLink.url} passHref target="_blank" rel="noopener noreferrer" className='w-full'>
                  <Button className="w-full">
                    View Papers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>A Note on Past Papers</CardTitle>
            <CardDescription>The link above will take you to the official Edexcel website, where you can find all available past papers for your GCSE History course.</CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
