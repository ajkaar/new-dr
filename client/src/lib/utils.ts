import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const pastDate = new Date(date);
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} year ago` : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} month ago` : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? `${interval} day ago` : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? `${interval} minute ago` : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function calculateProgress(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getSubjectColor(subject: string): string {
  const colors: { [key: string]: string } = {
    "Anatomy": "bg-red-500",
    "Physiology": "bg-blue-500",
    "Biochemistry": "bg-green-500",
    "Microbiology": "bg-yellow-500",
    "Pathology": "bg-purple-500",
    "Pharmacology": "bg-pink-500",
    "Forensic Medicine": "bg-indigo-500",
    "ENT": "bg-orange-500",
    "Ophthalmology": "bg-teal-500",
    "Community Medicine": "bg-cyan-500",
    "Medicine": "bg-amber-500",
    "Surgery": "bg-lime-500",
    "Obstetrics": "bg-emerald-500",
    "Gynecology": "bg-violet-500",
    "Pediatrics": "bg-fuchsia-500",
    "Psychiatry": "bg-rose-500",
    "Dermatology": "bg-sky-500",
    "Orthopedics": "bg-amber-600",
  };
  
  return colors[subject] || "bg-gray-500";
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  const names = name.split(" ");
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function formatTokenCount(tokens: number | string): string {
  if (tokens === "Unlimited") return "Unlimited";
  
  const numTokens = Number(tokens);
  if (isNaN(numTokens)) return "0";
  
  if (numTokens < 1000) return numTokens.toString();
  if (numTokens < 1000000) return `${(numTokens / 1000).toFixed(1)}K`;
  return `${(numTokens / 1000000).toFixed(1)}M`;
}

export function getDifficultyColor(difficulty: string): string {
  const colors: { [key: string]: string } = {
    "easy": "bg-green-100 text-green-800",
    "medium": "bg-yellow-100 text-yellow-800",
    "hard": "bg-red-100 text-red-800",
    "moderate": "bg-orange-100 text-orange-800",
    "advanced": "bg-purple-100 text-purple-800",
  };
  
  return colors[difficulty.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours} hr${hours === 1 ? '' : 's'} ${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}`;
}
