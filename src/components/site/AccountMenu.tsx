import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountMenuProps {
  user: User;
  isAdmin: boolean;
  onSignOut: () => void;
}

export const initialsOf = (user: User) => {
  const name = (user.user_metadata?.full_name as string | undefined) || user.email || "?";
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "B";
};

export const AccountMenu = ({ user, isAdmin, onSignOut }: AccountMenuProps) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-10 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] pl-1.5 pr-4 text-sm text-bone/85 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-bone"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bone font-mono text-[11px] font-semibold text-ink">
            {initialsOf(user)}
          </span>
          Account
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border-white/10 bg-ink-2/95 p-1.5 text-bone shadow-lift backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 py-2.5 font-normal">
          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Signed in as</span>
          <span className="mt-1 block truncate text-sm text-bone">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        <DropdownMenuItem
          onClick={() => navigate("/portal")}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-bone/80 focus:bg-white/[0.06] focus:text-bone"
        >
          <LayoutDashboard className="mr-3 h-4 w-4 text-beam" />
          Customer portal
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => navigate("/admin")}
            className="cursor-pointer rounded-xl px-3 py-2.5 text-bone/80 focus:bg-white/[0.06] focus:text-bone"
          >
            <Shield className="mr-3 h-4 w-4 text-ember" />
            Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-bone/70 focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
