
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';


export function MainNav() {
  const pathname = usePathname();
  const [isFlashcardMenuOpen, setIsFlashcardMenuOpen] = useState(pathname.startsWith('/flashcards'));

  const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Icons.dashboard,
  },
  {
    href: '/study',
    label: 'Study a Topic',
    icon: Icons.study,
  },
  {
    href: '/subjects',
    label: 'Browse Topics',
    icon: Icons.subjects,
  },
   {
    href: '/practice-exam',
    label: 'Practice Exam',
    icon: Icons.practiceExam,
  },
  {
    href: '/search',
    label: 'AI Search',
    icon: Icons.search,
  },
  {
    href: '/quiz',
    label: 'Quiz',
    icon: Icons.quiz,
  },
  {
    href: '/index',
    label: 'Index',
    icon: Icons.glossary,
  },
  {
    href: '/past-papers',
    label: 'Past Papers',
    icon: Icons.pastPapers,
  },
  {
    href: '/resources',
    label: 'Resources',
    icon: Icons.resources,
  },
];


  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
              asChild
              isActive={
                item.href === '/dashboard'
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon
                  className={cn('size-4 shrink-0')}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
       <Collapsible asChild onOpenChange={setIsFlashcardMenuOpen} open={isFlashcardMenuOpen}>
        <SidebarMenuItem>
            <div className="group/menu-item relative flex w-full items-center">
                 <SidebarMenuButton
                    isActive={pathname.startsWith('/flashcards')}
                    className="w-full"
                    asChild
                >
                    <Link href="/flashcards">
                        <Icons.flashcards className={cn('size-4 shrink-0')} aria-hidden="true" />
                        <span>Flashcards</span>
                    </Link>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                    <button className="absolute right-1 top-1.5 p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                        <ChevronRight className={cn("size-4 transition-transform", isFlashcardMenuOpen && "rotate-90")} />
                    </button>
                </CollapsibleTrigger>
            </div>
          <CollapsibleContent asChild>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/flashcards/dates'}>
                  <Link href="/flashcards/dates">Key Dates</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
