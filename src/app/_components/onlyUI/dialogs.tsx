"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState, type ReactNode } from "react";

type FormDialogProps = {
  title: string;
  triggerContent: ReactNode;
  dialogAction: (name: string) => void;
};

export function FormDialog({
  title,
  triggerContent,
  dialogAction,
}: FormDialogProps) {
  const [open, setOpen] = useState(false);
  const inputElement = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    const value = inputElement.current?.value.trim();
    if (!value || !(value.length > 0)) {
      return;
    }
    dialogAction(value);
    setOpen(false);
    e.preventDefault();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex flex-row justify-start bg-[#0d0f0d]"
          type="button"
        >
          {triggerContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-black bg-[#0d0f0d]">
        <DialogTitle>{title}</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input ref={inputElement} className="text-gray-200" required />

          <div className="flex w-full items-center justify-center gap-2">
            <DialogClose asChild>
              <Button type="button" className="w-1/2">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" className="w-1/2">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteDialogProps = {
  title: string;
  descriptionContent: string;
  triggerContent: ReactNode;
  dialogAction: () => void;
};

export function DeleteDialog({
  title,
  descriptionContent,
  triggerContent,
  dialogAction,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.FormEvent) => {
    dialogAction();
    setOpen(false);
    e.preventDefault();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex flex-row justify-start bg-[#0d0f0d] text-[#ff0000]"
          type="button"
        >
          {triggerContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-black bg-[#0d0f0d]">
        <DialogTitle>{title}</DialogTitle>

        <DialogDescription>{descriptionContent}</DialogDescription>

        <div className="flex w-full items-center justify-center gap-2">
          <DialogClose asChild>
            <Button type="button" className="w-1/2">
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleClick}
            type="submit"
            className="w-1/2 text-red-500"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
