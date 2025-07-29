"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function UploadedFiles({ exerciseId }: { exerciseId: string }) {
  const inputRef = useRef<null | HTMLInputElement>(null);

  const uploadFileMutation = api.r2.uploadFileSession.useMutation();
  const addKeyMutation = api.database.adduploadKey.useMutation();
  const deleteFileMutation = api.r2.deleteFile.useMutation();
  const { data } = api.r2.getPresingedGetUrls.useQuery({ exerciseId });

  const util = api.useUtils();
  const [isLoadingNewFile, setIsLoadingNewFile] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!data) return;
    if (data.length >= 5) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [data]);

  const handleInputChange = async () => {
    if (!inputRef.current) return;
    const files = inputRef.current.files;
    if (!files) return;
    const arrayFiles = Array.from(files);
    if (arrayFiles.length !== 1) {
      inputRef.current.value = "";
      return;
    }
    const file = files[0]!;
    console.log("tässä");
    setIsLoadingNewFile(true);

    uploadFileMutation.mutate(
      {
        contentType: file.type,
        exerciseId: exerciseId,
      },
      {
        onSuccess: async ({ downloadUrl, key, uploadUrl }) => {
          try {
            await fetch(uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            util.r2.getPresingedGetUrls.setData({ exerciseId }, (prev) => {
              if (!prev) return prev;
              return [...prev, { url: downloadUrl, key }];
            });
            setIsLoadingNewFile(false);

            addKeyMutation.mutate({ exerciseId: exerciseId, key: key });
          } catch (error) {
            console.log(error);
          }
        },
      },
    );
    inputRef.current.value = "";
  };

  const handleRemoveImage = (key: string) => {
    util.r2.getPresingedGetUrls.setData({ exerciseId }, (prev) => {
      if (!prev) return prev;
      return prev.filter((e) => e.key !== key);
    });
    deleteFileMutation.mutate({ exerciseId, key });
  };
  return (
    <div className="flex w-full items-center gap-2">
      <Input
        id="fileUpload"
        type="file"
        accept="image/*"
        hidden
        onChange={handleInputChange}
        ref={inputRef}
        disabled={isDisabled}
      />
      {isDisabled ? (
        <Tooltip>
          <TooltipTrigger>
            <Label className="flex h-10 w-36 items-center justify-center rounded-sm border-1 border-teal-900 p-3">
              Upload problem
            </Label>
          </TooltipTrigger>
          <TooltipContent className="text-red-700">
            Maximum 5 files
          </TooltipContent>
        </Tooltip>
      ) : (
        <Label
          htmlFor="fileUpload"
          className="hover:bg-secondaryBg flex h-10 w-36 items-center justify-center rounded-sm border-1 border-teal-900 p-3"
        >
          Upload problem
        </Label>
      )}
      {data &&
        data.map(({ url, key }) => (
          <div
            key={key}
            className="relative h-30 w-30 cursor-pointer rounded border-teal-900 p-2 hover:border-1"
          >
            <Image
              src={url}
              alt="preview"
              width={150}
              height={150}
              className="h-25 w-25"
            />
            <button
              onClick={() => handleRemoveImage(key)}
              className="bg-secondaryBg absolute top-1 right-1 z-10 cursor-pointer rounded-full p-1 text-white"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      {isLoadingNewFile && <Skeleton className="h-30 w-30 bg-[#232b26]" />}
    </div>
  );
}
