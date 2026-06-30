import {
  Target, Monitor, Settings2, Bot, Search, TrendingUp, PenTool, Clapperboard,
  Presentation, Workflow, BarChart3, Rocket, Building2, HardHat, Hammer,
  Snowflake, House, Sun, Car, Stethoscope, Dumbbell, Flower2, Sofa, ShoppingBag,
  Briefcase, Zap, Landmark, Sparkles, ArrowRight, ArrowUpRight, ArrowLeft, Star, Check,
  CheckCircle2, Plus, Menu, X, Mail, Phone, MapPin, Play,
  ArrowDown, Award, Quote, ExternalLink, Cpu, Layers, LineChart,
  Users, Lightbulb, Calendar, Globe, Compass, GraduationCap,
  type LucideIcon,
} from "lucide-react";

// Curated, tree-shakeable icon set. Content stores a key (e.g. "target");
// God Mode will offer this list. No emojis anywhere — ever.
const MAP: Record<string, LucideIcon> = {
  // services
  target: Target,
  monitor: Monitor,
  settings: Settings2,
  bot: Bot,
  search: Search,
  "trending-up": TrendingUp,
  "pen-tool": PenTool,
  clapperboard: Clapperboard,
  presentation: Presentation,
  workflow: Workflow,
  "bar-chart": BarChart3,
  rocket: Rocket,
  // industries
  "building-2": Building2,
  "hard-hat": HardHat,
  hammer: Hammer,
  snowflake: Snowflake,
  house: House,
  sun: Sun,
  car: Car,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  "flower-2": Flower2,
  sofa: Sofa,
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
  zap: Zap,
  landmark: Landmark,
  // ui
  sparkles: Sparkles,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "arrow-left": ArrowLeft,
  star: Star,
  check: Check,
  "check-circle": CheckCircle2,
  plus: Plus,
  menu: Menu,
  x: X,
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
  play: Play,
  "arrow-down": ArrowDown,
  award: Award,
  quote: Quote,
  "external-link": ExternalLink,
  cpu: Cpu,
  layers: Layers,
  "line-chart": LineChart,
  users: Users,
  lightbulb: Lightbulb,
  calendar: Calendar,
  globe: Globe,
  compass: Compass,
  "graduation-cap": GraduationCap,
};

export const ICON_KEYS = Object.keys(MAP);

export function Icon({
  name,
  className,
  size = 20,
  strokeWidth = 2,
  fill = "none",
}: {
  name?: string | null;
  className?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
}) {
  const Cmp = (name && MAP[name]) || Sparkles;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} fill={fill} aria-hidden />;
}
