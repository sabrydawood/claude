import {
  Bot, MessageCircle, Sparkles, Trophy, Rocket, Target, Flame, Zap, Crown,
  Compass, Palette, Settings2, Code2, GraduationCap, Star, BookOpen,
  Gamepad2, Brain, Eye, FlaskConical, Coffee, Briefcase, UserRound,
  Leaf, TreePine, Sprout, Baby, Globe, TrendingUp, type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Bot, MessageCircle, Sparkles, Trophy, Rocket, Target, Flame, Zap, Crown,
  Compass, Palette, Settings2, Code2, GraduationCap, Star, BookOpen,
  Gamepad2, Brain, Eye, FlaskConical, Coffee, Briefcase, UserRound,
  Leaf, TreePine, Sprout, Baby, Globe, TrendingUp,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, size = 24, ...props }: DynamicIconProps) {
  const Icon = ICON_MAP[name] ?? Bot;
  return <Icon size={size} {...props} />;
}
