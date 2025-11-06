import { memo } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

function PageHeaderComponent({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
}

export const PageHeader = memo(PageHeaderComponent);
