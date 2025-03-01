"use client";

import { createMessage } from "@/app/actions/messages";
import { MessageSchema, messageSchema } from "@/lib/validations/MessageSchema";
import { handleFormServerErrors } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { getCurrentUser } from "@/app/actions/auth";

export default function ChatForm() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = async (data: MessageSchema) => {
    const targetUserId = await getCurrentUser({ username: params.username });
    if (!targetUserId) {
      setError("root.serverError", { message: "User not found" });
      return;
    }
    const result = await createMessage(targetUserId.id, data);
    if (result.status === "error") {
      handleFormServerErrors(result, setError);
    } else {
      reset();
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type a message"
          {...register("text")}
          disabled={!!errors.text}
        />
        {errors.text && (
          <p className="text-danger text-sm">{errors.text.message}</p>
        )}
        <Button
          type="submit"
          color="default"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? <Spinner /> : <Send size={18} />}
        </Button>
      </div>
      <div className="flex flex-col">
        {errors.root?.serverError && (
          <p className="text-danger text-sm">
            {errors.root.serverError.message}
          </p>
        )}
      </div>
    </form>
  );
}
