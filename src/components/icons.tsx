
import React, { type SVGProps } from 'react';
import {
  BookCopy,
  ClipboardList,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Video,
  MessageCircleQuestion,
  BookOpen,
  BookText,
  Search,
  BrainCircuit,
  Landmark,
  Shield,
  HeartPulse,
  Castle,
  Globe,
} from 'lucide-react';

// Memoize each icon component to prevent unnecessary re-renders.
const Logo = React.memo((props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 8v8" />
    <path d="M8.5 14.5l7-5" />
    <path d="M8.5 9.5l7 5" />
  </svg>
));
Logo.displayName = 'Logo';

const DashboardIcon = React.memo(LayoutDashboard);
const SubjectsIcon = React.memo(BookCopy);
const StudyIcon = React.memo(BookOpen);
const FlashcardsIcon = React.memo(Lightbulb);
const QuizIcon = React.memo(ListTodo);
const ResourcesIcon = React.memo(Video);
const PastPapersIcon = React.memo(ClipboardList);
const AiHelperIcon = React.memo(MessageCircleQuestion);
const GlossaryIcon = React.memo(BookText);
const SearchIcon = React.memo(Search);
const PracticeExamIcon = React.memo(BrainCircuit);

// History Topic Icons
const ColdWarIcon = React.memo(Globe);
const WeimarIcon = React.memo(Landmark);
const MedicineIcon = React.memo(HeartPulse);
const NormanIcon = React.memo(Castle);


export const Icons = {
  logo: Logo,
  dashboard: DashboardIcon,
  subjects: SubjectsIcon,
  study: StudyIcon,
  flashcards: FlashcardsIcon,
  quiz: QuizIcon,
  resources: ResourcesIcon,
  pastPapers: PastPapersIcon,
  aiHelper: AiHelperIcon,
  glossary: GlossaryIcon,
  search: SearchIcon,
  practiceExam: PracticeExamIcon,
  coldWar: ColdWarIcon,
  weimar: WeimarIcon,
  medicine: MedicineIcon,
  norman: NormanIcon,
};
