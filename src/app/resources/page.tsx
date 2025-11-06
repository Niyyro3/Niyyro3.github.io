import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resources } from '@/lib/data';
import { Icons } from '@/components/icons';

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Curated Resources"
        description="Supplementary reading and videos to boost your learning."
      />
      <div className="grid gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-4 font-headline flex items-center">
            <Icons.subjects className="mr-3 h-6 w-6" /> Reading Materials
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.reading.map((item, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    Find out more
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4 font-headline flex items-center">
            <Icons.resources className="mr-3 h-6 w-6" /> Video Lessons
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.videos.map((item, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </CardContent>
                 <div className="p-6 pt-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    Watch video
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
