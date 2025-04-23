"use client";

import { useTransition } from "react";
import { SendMessageFormData, sendMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMessageStore, MessageWithSender } from "@/store/message-store";

interface MessageInputProps {
  recipientId: string;
}

const formSchema = z.object({
  text: z
    .string()
    .min(1, {
      message: "Message cannot be empty",
    })
    .max(280, {
      message: "Message cannot exceed 280 characters",
    }),
});

export function MessageInput({ recipientId }: MessageInputProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { addMessage } = useMessageStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const data: SendMessageFormData = {
        text: values.text,
        recipientId,
      };

      const result = await sendMessage(data);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        if (result.message) {
          addMessage(result.message as MessageWithSender);
        }
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Type a message..."
                  {...field}
                  disabled={isPending}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" disabled={isPending}>
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </form>
    </Form>
  );
}
