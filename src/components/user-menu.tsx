import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <div className="h-9 w-40" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth" search={{ mode: "signin" }}>Sign in</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full px-4">
          <Link to="/auth" search={{ mode: "signup" }}>Create account</Link>
        </Button>
      </div>
    );
  }

  const name = (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "Student";
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-36 truncate text-sm font-medium lg:block">{name}</span>
      <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
        <LogOut />
      </Button>
    </div>
  );
}
