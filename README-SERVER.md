# Server-Side Usage

The media library package provides server-side utilities for file storage and API route handlers.

## Authentication

**This package is authentication-agnostic** - it doesn't depend on any specific authentication library. It only requires a `getUserId` callback function that returns the current user's ID (or `null` if not authenticated).

- All server-side file operations **require authentication** - files can only be saved/accessed by authenticated users
- The `getUserId` callback can integrate with any auth system (BetterAuth, NextAuth, Clerk, custom, etc.)
- The package validates that `userId` is provided before saving any files to the filesystem

## Installation

The server utilities are available via the `/server` export:

```ts
import { 
  saveMediaFile, 
  createMediaRoutes 
} from '@reactkits.dev/react-media-library/server';
```

## Storage Utilities

### Configure Storage

```ts
import { configureMediaStorage } from '@reactkits.dev/react-media-library/server';

configureMediaStorage({
  storagePath: '/srv/myapp/media', // Default: /srv/appframes/media
  maxFileSize: 100 * 1024 * 1024, // 100MB default
});
```

### Save Files

**Note:** `userId` is required and must be a non-empty string. The function will throw an error if the user is not authenticated.

```ts
import { saveMediaFile } from '@reactkits.dev/react-media-library/server';

// userId must be provided - typically from your auth system
const relativePath = await saveMediaFile(userId, file, 'image.jpg');
// Returns: "user-id-123/1234567890-image.jpg"

// This will throw an error:
// await saveMediaFile('', file, 'image.jpg'); // Error: User ID is required
```

### Read Files

```ts
import { readMediaFile } from '@reactkits.dev/react-media-library/server';

const buffer = await readMediaFile('user-id-123/1234567890-image.jpg');
```

## API Route Handlers

### Create Routes

The `getUserId` callback can integrate with **any authentication system**. Here are examples:

**With BetterAuth:**
```ts
// app/api/media/assets/route.ts
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'; // BetterAuth
import { db } from '@/db';
import { mediaAssets } from '@/db/schema';
import { createMediaAssetsRoutes } from '@reactkits.dev/react-media-library/server/nextjs/routes';

export const { POST, GET } = createMediaAssetsRoutes({
  getUserId: async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id || null;
  },
  db,
  mediaAssetsTable: mediaAssets,
});
```

**With NextAuth:**
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const { POST, GET } = createMediaAssetsRoutes({
  getUserId: async () => {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
  },
  db,
  mediaAssetsTable: mediaAssets,
});
```

**With Custom Auth:**
```ts
export const { POST, GET } = createMediaAssetsRoutes({
  getUserId: async () => {
    // Your custom auth logic here
    const token = await getTokenFromRequest();
    const user = await verifyToken(token);
    return user?.id || null;
  },
  db,
  mediaAssetsTable: mediaAssets,
});
```

**Important:** The `getUserId` function should return:
- A non-empty string if the user is authenticated
- `null` if the user is not authenticated (routes will return 401 Unauthorized)

### Asset by ID Routes

```ts
// app/api/media/assets/[id]/route.ts
import { createMediaAssetByIdRoutes } from '@reactkits.dev/react-media-library/server/routes';

export const { GET, DELETE } = createMediaAssetByIdRoutes({
  getUserId: async () => { /* ... */ },
  db,
  mediaAssetsTable: mediaAssets,
});
```

### Thumbnail Route

```ts
// app/api/media/assets/[id]/thumbnail/route.ts
import { createThumbnailRoute } from '@reactkits.dev/react-media-library/server/routes';

export const { GET } = createThumbnailRoute({
  getUserId: async () => { /* ... */ },
  db,
  mediaAssetsTable: mediaAssets,
});
```

## Database Schema

You'll need to create a `media_assets` table in your database. Example with Drizzle:

```ts
// db/schema.ts
import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema'; // Your user table

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  path: text('path').notNull(), // Relative path from storage root
  thumbnailPath: text('thumbnail_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('media_assets_user_id_idx').on(table.userId),
  createdAtIdx: index('media_assets_created_at_idx').on(table.createdAt),
}));
```

## Environment Variables

```env
MEDIA_STORAGE_PATH=/srv/appframes/media
```

## Docker Setup

Add volume to `docker-compose.yml`:

```yaml
services:
  web:
    volumes:
      - media_storage:/srv/appframes/media
    environment:
      MEDIA_STORAGE_PATH: /srv/appframes/media

volumes:
  media_storage:
```

## Full Example

See `app/api/media/assets/route.ts` in this repository for a complete working example.
