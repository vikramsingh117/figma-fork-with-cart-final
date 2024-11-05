import { LiveMap, createClient, IUserInfo, ResolveUsersArgs } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  throttle: 16,
  publicApiKey: "pk_prod_IjyDx_DJkuPGsDZdFPR1MrDKgxxbFKq9P4nTeZwJdS6PUUkD-YCsn1UwHqpUYODS",
  
  resolveUsers: async ({ userIds }: ResolveUsersArgs) => {
    // Example: You may have some logic to fetch user data from an API or database
    // Here we're just returning a mock user object

    // Mock response
    const users: IUserInfo[] = userIds.map(userId => ({
      userId,
      name: `User ${userId}`, // Just an example, you can customize this
    }));

    return users; // Return an array of user objects
  },
});
type Presence = {};

type Storage = {
  canvasObjects: LiveMap<string, any>;
};

type UserMeta = {};

type RoomEvent = {};

export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client,
  {
    async resolveUsers({ userIds }) {
      return [];
    },
    async resolveMentionSuggestions({ text, roomId }) {
      return [];
    },
  }
);
