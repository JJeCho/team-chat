"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

const ChannelIdPage = () => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();

  return (
    <div>ChannelId Page</div>
  )
}

export default ChannelIdPage