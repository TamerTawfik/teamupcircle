"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { submitFeedback, FeedbackResponse } from "@/app/actions/feedback";
import { useToast } from "@/hooks/use-toast";

export function FeedbackForm() {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Get the current URL when the component mounts
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("feedback", value);
    formData.append("pageUrl", currentUrl);

    startTransition(async () => {
      try {
        const response: FeedbackResponse = await submitFeedback(formData);

        if (response.success) {
          setIsSuccess(true);
          setValue("");
          toast({
            title: "Success",
            description: "Thank you for your feedback!",
          });

          // Reset after 3 seconds
          setTimeout(() => {
            setIsSuccess(false);
            setIsOpen(false);
          }, 3000);
        } else {
          setError(response.message);
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="md:block">
        <Button
          variant="outline"
          className="rounded-full font-normal h-[32px] p-0 px-3 text-xs text-foreground"
        >
          Beta feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] h-[200px]"
        sideOffset={10}
        align="end"
      >
        {isSuccess ? (
          <div className="flex items-center justify-center flex-col space-y-1 mt-10 text-center">
            <p className="text-sm text-[#4C4C4C]">
              Thank you for your feedback!, We will be back with you as soon as
              possible.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Textarea
              name="feedback"
              value={value}
              required
              autoFocus
              placeholder="Ideas to improve this page or issues you are experiencing."
              className="resize-none h-[120px]"
              onChange={(evt) => setValue(evt.target.value)}
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            <div className="mt-1 flex items-center justify-end">
              <Button type="submit" disabled={isPending || !value.trim()}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
