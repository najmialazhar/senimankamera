"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/src/modules/auth/actions/login.action";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    { error: null as string | null }
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center mb-4">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Masuk Admin Studio</h1>
        <p className="font-sans text-xs text-secondary tracking-wide uppercase">
          Masukkan kredensial untuk mengelola studio
        </p>
      </div>

      <div className="space-y-4">
        {state?.error && (
          <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
            Alamat Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            className="rounded-none border-border focus:border-primary focus-visible:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="rounded-none border-border focus:border-primary focus-visible:ring-0 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary focus:outline-none transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none mt-2"
        >
          {isPending ? "Masuk..." : "Masuk"}
        </Button>
      </div>
    </form>
  );
}
