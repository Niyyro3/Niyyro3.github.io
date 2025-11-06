
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formulaData } from '@/lib/formulas';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default function FormulasPage() {
  const physicsFormulas = formulaData.filter((f) => f.subject === 'Physics');
  const chemistryFormulas = formulaData.filter(
    (f) => f.subject === 'Chemistry'
  );

  return (
    <>
      <PageHeader
        title="Formula Sheet"
        description="Key equations for AQA GCSE Physics and Chemistry."
      />

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 flex items-center">
            <Icons.physics className="mr-3 h-6 w-6 text-primary" />
            Physics Equations
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {physicsFormulas.map((formula) => (
              <Card key={formula.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{formula.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p
                      className="text-lg font-bold font-mono text-primary"
                      dangerouslySetInnerHTML={{ __html: formula.equationHtml }}
                    ></p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Where:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {formula.variables.map((v) => (
                        <li key={v.symbol}>
                          <span className="font-mono font-semibold text-foreground">
                            {v.symbol}
                          </span>{' '}
                          = {v.name} ({v.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 flex items-center">
            <Icons.chemistry className="mr-3 h-6 w-6 text-primary" />
            Chemistry Equations
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chemistryFormulas.map((formula) => (
              <Card key={formula.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{formula.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p
                      className="text-lg font-bold font-mono text-primary"
                      dangerouslySetInnerHTML={{ __html: formula.equationHtml }}
                    ></p>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-2">Where:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {formula.variables.map((v) => (
                        <li key={v.symbol}>
                          <span className="font-mono font-semibold text-foreground">
                            {v.symbol}
                          </span>{' '}
                          = {v.name} ({v.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
