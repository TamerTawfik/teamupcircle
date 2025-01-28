"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setUsername } from "@/app/actions/username";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
});

type FormData = z.infer<typeof schema>;

export default function UsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await setUsername(data.username);
    if (result?.error) {
      alert(result.error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("username")}
        placeholder="Username"
        className="w-full p-2 border rounded"
      />
      {errors.username && (
        <p className="text-red-500 text-sm">{errors.username.message}</p>
      )}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Continue
      </button>
    </form>
  );
}
