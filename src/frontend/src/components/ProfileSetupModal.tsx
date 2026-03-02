import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export function ProfileSetupModal() {
  const [username, setUsername] = useState("");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    saveProfile(username.trim(), {
      onSuccess: () => {
        toast.success("Welcome to EventConnect India! 🎉");
      },
      onError: () => {
        toast.error("Failed to save profile. Please try again.");
      },
    });
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Welcome to EventConnect India!
          </DialogTitle>
          <DialogDescription className="text-center">
            Set up your profile to start posting events and earning rewards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              autoFocus
              maxLength={50}
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gold/10 border border-gold/20">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              Earn ₹10–₹20 reward for every event you post!
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!username.trim() || isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
