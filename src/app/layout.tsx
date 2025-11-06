import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Separator } from '@/components/ui/separator';
import { AiHelper } from '@/components/ai-helper';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


export const metadata: Metadata = {
  title: 'HistoryStudies.net',
  description: 'Your personalized guide to mastering AQA GCSE Science.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body", inter.variable)}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Icons.logo className="size-8 text-sidebar-primary" />
                <span className="text-lg font-semibold text-sidebar-foreground">
                  HistoryStudies.net
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
            <SidebarFooter>
              <Separator className="my-2 bg-sidebar-border" />
               <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
                 <p className="text-xs text-muted-foreground">&copy; 2024 HistoryStudies.net</p>
               </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
        <AiHelper />
      </body>
    </html>
  );
}
