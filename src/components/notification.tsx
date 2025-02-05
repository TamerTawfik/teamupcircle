"use client";

import { Button } from "@/components/ui/button";
import { Inbox, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

function EmptyState({ description }: { description: string }) {
  return (
    <div className="h-[460px] flex items-center justify-center flex-col space-y-4">
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
        <Inbox size={18} />
      </div>
      <p className="text-[#606060] text-sm">{description}</p>
    </div>
  );
}

export function Notification() {
  const [isOpen, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 flex items-center relative"
        >
          <Bell size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="h-[535px] w-screen md:w-[400px] p-0 overflow-hidden relative"
        align="end"
        sideOffset={10}
      >
        <Tabs defaultValue="inbox">
          <TabsList className="w-full justify-start bg-transparent border-b-[1px] rounded-none py-6">
            <TabsTrigger value="inbox" className="font-normal">
              Inbox
            </TabsTrigger>
            <TabsTrigger value="archive" className="font-normal">
              Archive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="relative mt-0">
            <ScrollArea className="pb-12 h-[485px]">
              <div className="divide-y">
                <EmptyState description={"No new notifications"} />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="archive" className="mt-0">
            <ScrollArea className="h-[490px]">
              <div className="divide-y">
                <EmptyState description={"Nothing in the archive"} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
