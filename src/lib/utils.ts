import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {  format, formatDistance } from 'date-fns';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ZodIssue } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatShortDateTime(date: Date) {
  return format(date, 'dd MMM yy h:mm:a')
}

export function handleFormServerErrors<TFieldValues extends FieldValues>(
  errorResponse: { error: string | ZodIssue[] },
  setError: UseFormSetError<TFieldValues>
) {
  if (Array.isArray(errorResponse.error)) {
      errorResponse.error.forEach((e) => {
          const fieldName = e.path.join('.') as Path<TFieldValues>
          setError(fieldName, { message: e.message })
      })
  } else {
      setError('root.serverError', { message: errorResponse.error });
  }
}

export function truncateString(text?: string | null, num = 50) {
  if (!text) return null;
  if (text.length <= num) {
      return text;
  }
  return text.slice(0, num) + '...';
}

export function createChatId(a: string, b: string) {
  return a > b ? `${b}-${a}` : `${a}-${b}`
}

export function timeAgo(date: string) {
  return formatDistance(new Date(date), new Date()) + ' ago';
}