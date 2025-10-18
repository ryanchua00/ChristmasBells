import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const christmasMessages = {
  success: [
    "🎄 Ho ho ho! Success!",
    "🎅 Santa approves!",
    "⭐ Christmas magic worked!",
    "🎁 Gift-tastic success!",
    "❄️ Snow good news!",
    "🔔 Jingle bells, it worked!",
  ],
  error: [
    "🎄 Oops! The elves are on break!",
    "🎅 Santa's workshop is busy!",
    "❄️ A little Christmas hiccup!",
    "🎁 The reindeer got confused!",
    "⭐ Christmas magic needs a moment!",
    "🔔 Jingle bells, try again!",
  ]
};

export function getRandomMessage(type: 'success' | 'error'): string {
  const messages = christmasMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
