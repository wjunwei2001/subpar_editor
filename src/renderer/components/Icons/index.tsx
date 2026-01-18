/**
 * Subpar Editor Icon System
 * Using Lucide Icons - https://lucide.dev
 *
 * This file provides a centralized icon mapping to replace all emojis
 * with consistent, scalable SVG icons.
 */

import {
  // Gacha & Lootbox
  Dices,
  Gift,
  Package,
  Crown,
  Trophy,
  Tag,

  // Effects
  Sparkles,
  Skull,
  Zap,
  Bomb,

  // Features
  Brain,
  BrainCircuit,
  Keyboard,
  Pencil,
  Palette,
  Eye,
  Bot,
  Type,
  Scaling,
  GitBranch,
  GitCommit,

  // Curses
  Bug,
  Ghost,
  Search,
  Angry,
  Tv,
  Rainbow,
  Drama,
  Frown,

  // Meta Curses
  Clover,
  TrendingDown,
  Clock,
  Timer,

  // Special
  Shield,
  ShieldCheck,
  Infinity,

  // Files & Folders
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Globe,
  Hash,

  // Utility
  Lock,
  LockOpen,
  Check,
  CheckCircle,
  X,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Target,
  Flame,
  Lightbulb,
  Settings,
  ShoppingCart,
  Save,
  Compass,
  FolderTree,
  FlaskConical,
  User,
  CircleUser,
  MessageSquare,
  Bookmark,
  CircleDot,
} from 'lucide-react';

import type { LucideProps } from 'lucide-react';
import React from 'react';

// Re-export all icons for direct use
export {
  Dices,
  Gift,
  Package,
  Crown,
  Trophy,
  Tag,
  Sparkles,
  Skull,
  Zap,
  Bomb,
  Brain,
  BrainCircuit,
  Keyboard,
  Pencil,
  Palette,
  Eye,
  Bot,
  Type,
  Scaling,
  GitBranch,
  GitCommit,
  Bug,
  Ghost,
  Search,
  Angry,
  Tv,
  Rainbow,
  Drama,
  Frown,
  Clover,
  TrendingDown,
  Clock,
  Timer,
  Shield,
  ShieldCheck,
  Infinity,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Globe,
  Hash,
  Lock,
  LockOpen,
  Check,
  CheckCircle,
  X,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Target,
  Flame,
  Lightbulb,
  Settings,
  ShoppingCart,
  Save,
  Compass,
  FolderTree,
  FlaskConical,
  User,
  CircleUser,
  MessageSquare,
  Bookmark,
  CircleDot,
};

// Default icon props for consistency
export const DEFAULT_ICON_SIZE = 16;
export const DEFAULT_STROKE_WIDTH = 2;

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE ICON MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

type IconComponent = React.FC<LucideProps>;

/** Maps feature names to their positive state icons */
export const FEATURE_ICONS: Record<string, IconComponent> = {
  lsp: Brain,
  git: GitBranch,
  autocomplete: Keyboard,
  codeEditing: Pencil,
  themeMode: Palette,
  codeColour: Eye,
  agentsPanel: Bot,
  textSize: Type,
  aspectRatio: Scaling,
};

/** Maps feature names to their curse state icons */
export const CURSE_ICONS: Record<string, IconComponent> = {
  lsp: Bug,
  git: Skull,
  autocomplete: Angry,
  codeEditing: Frown,
  themeMode: Rainbow,
  codeColour: Ghost,
  agentsPanel: Tv,
  textSize: Search,
  aspectRatio: Drama,
};

/** Maps special effect IDs to their icons */
export const SPECIAL_ICONS: Record<string, IconComponent> = {
  godMode: Crown,
  immunityShield: ShieldCheck,
  infiniteQuota: Infinity,
};

/** Maps meta curse IDs to their icons */
export const META_CURSE_ICONS: Record<string, IconComponent> = {
  lootboxAddict: Dices,
  badLuck: Clover,
  quotaDrain: TrendingDown,
  timerReduction: Timer,
};

// ═══════════════════════════════════════════════════════════════════════════
// FILE ICON MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

/** Maps file extensions to their icons */
export const FILE_ICONS: Record<string, IconComponent> = {
  js: FileCode,
  jsx: FileCode,
  ts: FileType,
  tsx: FileType,
  py: FileCode,
  json: FileJson,
  md: FileText,
  html: Globe,
  css: Hash,
};

/** Get icon component for a filename */
export function getFileIcon(filename: string): IconComponent {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || File;
}

// ═══════════════════════════════════════════════════════════════════════════
// EFFECT CATEGORY ICONS
// ═══════════════════════════════════════════════════════════════════════════

/** Get icon for effect category */
export function getCategoryIcon(category: 'positive' | 'neutral' | 'negative'): IconComponent {
  switch (category) {
    case 'positive':
      return Sparkles;
    case 'neutral':
      return Trophy;
    case 'negative':
      return Skull;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOOTBOX TYPE ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const LOOTBOX_ICONS: Record<string, IconComponent> = {
  basic: Package,
  premium: Gift,
  legendary: Crown,
};

/** Get icon for lootbox type */
export function getLootboxIcon(type: 'basic' | 'premium' | 'legendary'): IconComponent {
  return LOOTBOX_ICONS[type] || Package;
}

// ═══════════════════════════════════════════════════════════════════════════
// ICON WRAPPER COMPONENT
// For easy styling and consistency
// ═══════════════════════════════════════════════════════════════════════════

interface IconWrapperProps extends LucideProps {
  icon: IconComponent;
}

export const Icon: React.FC<IconWrapperProps> = ({
  icon: IconComponent,
  size = DEFAULT_ICON_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  ...props
}) => {
  return <IconComponent size={size} strokeWidth={strokeWidth} {...props} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get icon for gacha effect
// ═══════════════════════════════════════════════════════════════════════════

interface GachaEffect {
  type: 'timer' | 'quota' | 'special' | 'badge' | 'curse' | 'metaCurse';
  feature?: string;
  effectId?: string;
  curseId?: string;
}

export function getEffectIcon(
  effect: GachaEffect,
  category: 'positive' | 'neutral' | 'negative'
): IconComponent {
  if (effect.type === 'timer' || effect.type === 'quota') {
    const feature = effect.feature || '';
    return FEATURE_ICONS[feature] || Sparkles;
  }

  if (effect.type === 'special') {
    const effectId = effect.effectId || '';
    return SPECIAL_ICONS[effectId] || Sparkles;
  }

  if (effect.type === 'curse') {
    const feature = effect.feature || '';
    return CURSE_ICONS[feature] || Skull;
  }

  if (effect.type === 'metaCurse') {
    const curseId = effect.curseId || '';
    return META_CURSE_ICONS[curseId] || Bomb;
  }

  // Badge or fallback
  return getCategoryIcon(category);
}
