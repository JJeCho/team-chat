import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import {differenceInMinutes, format, isToday, isYesterday} from "date-fns";
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-members";

interface MessageListProps {
    memberName?: string;
    memberImage?: string;
    channelName?: string;
    channelCreationTime?: number;
    variant?: "channel" | "thread" | "conversation";
    data: GetMessagesReturnType | undefined
    loadMore: () => void;
    isLoadingMore: boolean;
    canLoadMore: boolean;
}

const TIME_THRESHOLD = 5;

const adjustToPST = (date: Date): Date => {
    const pstOffset = new Date().getTimezoneOffset() * 60000; // Calculate the timezone offset
    return new Date(date.getTime() - pstOffset);
  };

const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM, d")
}

export const MessageList = ({
    memberName,
    memberImage,
    channelName,
    channelCreationTime,
    variant ="channel",
    data,
    loadMore,
    isLoadingMore,
    canLoadMore
}: MessageListProps) => {
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const workspaceId = useWorkspaceId();
    const {data: currentMember} = useCurrentMember({workspaceId});
    const groupedMessages = data?.reduce((groups, message) => {
        const date = new Date(message._creationTime);
        const dateKey = format(date, "yyyy-MM-dd");

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].unshift(message);
        return groups;
    }, {} as Record<string, typeof data>);

    return (
        <div className="flex flex-1 flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                <div key = {dateKey}>
                    <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                            {formatDateLabel(dateKey)}
                        </span>
                    </div>
                    {messages.map((message, index) => {
                        const prevMessage = messages[index-1];
                        const isCompact = 
                        prevMessage &&
                        prevMessage.user?._id === message.user?._id &&
                        differenceInMinutes(
                            new Date(prevMessage._creationTime),
                            new Date(message._creationTime),
                        ) < TIME_THRESHOLD;
                 

                        return (
                            <Message 
                            key={message._id}
                            id={message._id}
                            memberId={message.memberId}
                            authorImage={message.user.image}
                            authorName={message.user.name}
                            isAuthor={message.memberId === currentMember?._id}
                            reactions={message.reactions}
                            body={message.body}
                            image={message.image}
                            updatedAt={message.updatedAt}
                            createdAt={message._creationTime}
                            isEditing={editingId === message._id}
                            setEditingId={setEditingId}                         isCompact={isCompact}
                            hideThreadButton={variant === "thread"}
                            threadCount={message.threadCount}
                            threadImage={message.threadImage}
                            threadTimestamp={message.threadTimestamp}
                            />
                        )
                    })}
                </div>
            ))}
            {variant === "channel" && channelName && channelCreationTime && (
                <ChannelHero
                name={channelName}
                creationTime={channelCreationTime}
                />
            )}
        </div>
    )
}