import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';

const prisma = new PrismaClient();

const eras = [
  {
    slug: '2000s',
    name: '2000s',
    description: 'Early internet nostalgia, glossy desktop motifs, and whimsical old-school culture.',
    sortOrder: 1,
    metadata: JSON.stringify({ vibe: 'glossy', accent: '#ffb800' }),
  },
  {
    slug: '2010s',
    name: '2010s',
    description: 'Meme culture, scrapbook aesthetics, and chaotic social-sharing energy.',
    sortOrder: 2,
    metadata: JSON.stringify({ vibe: 'tumblr', accent: '#c96eff' }),
  },
  {
    slug: '2020s',
    name: '2020s',
    description: 'Brainrot and absurd humor in a surreal, high-speed internet climate.',
    sortOrder: 3,
    metadata: JSON.stringify({ vibe: 'chaos', accent: '#00d1ff' }),
  },
];

async function main() {
  await prisma.user.deleteMany();
  await prisma.userCollectible.deleteMany();
  await prisma.desktopConfiguration.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.collectible.deleteMany();
  await prisma.application.deleteMany();
  await prisma.activityDefinition.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.era.deleteMany();

  const createdEras = await Promise.all(
    eras.map((era) =>
      prisma.era.create({
        data: era,
      }),
    ),
  );

  const createdApplications = await Promise.all([
    prisma.application.create({
      data: {
        slug: 'pixelchat',
        name: 'PixelChat',
        description: 'A lively instant-messaging room full of nostalgic profiles and playful statuses.',
        category: 'messaging',
        eraId: createdEras[0].id,
        icon: 'chat',
        config: JSON.stringify({ roomCount: 3, defaultTheme: 'sparkle' }),
      },
    }),
    prisma.application.create({
      data: {
        slug: 'glitterspace',
        name: 'GlitterSpace',
        description: 'Customize a digital personality with shimmering badges, accessories, and profile flair.',
        category: 'profile',
        eraId: createdEras[0].id,
        icon: 'profile',
        config: JSON.stringify({ badgeSlots: 4 }),
      },
    }),
    prisma.application.create({
      data: {
        slug: 'memefeed',
        name: 'MemeFeed',
        description: 'A chaotic social stream full of reaction images and mocking commentary.',
        category: 'feed',
        eraId: createdEras[1].id,
        icon: 'meme',
        config: JSON.stringify({ feedLength: 15 }),
      },
    }),
    prisma.application.create({
      data: {
        slug: 'blogspace',
        name: 'BlogSpace',
        description: 'Short-form microblogging with pastel layouts and dramatic reblog energy.',
        category: 'microblog',
        eraId: createdEras[1].id,
        icon: 'notes',
        config: JSON.stringify({ draftLimit: 3 }),
      },
    }),
    prisma.application.create({
      data: {
        slug: 'brainrot-feed',
        name: 'Brainrot Feed',
        description: 'A high-speed stream of absurd lore, surreal captions, and nonsense trends.',
        category: 'feed',
        eraId: createdEras[2].id,
        icon: 'signal',
        config: JSON.stringify({ trendScale: 100 }),
      },
    }),
    prisma.application.create({
      data: {
        slug: 'meme-lab',
        name: 'Meme Lab',
        description: 'Generate surreal captions by combining absurd characters and fragments of lore.',
        category: 'generator',
        eraId: createdEras[2].id,
        icon: 'lab',
        config: JSON.stringify({ templates: 12 }),
      },
    }),
  ]);

  const collectibles = await Promise.all([
    prisma.collectible.create({
      data: {
        slug: 'pixel-badge',
        name: 'Pixel Badge',
        description: 'A spangly little token earned by exploring the early internet.',
        category: 'badge',
        eraId: createdEras[0].id,
        rarity: 'common',
        assetReference: 'badge-pixel',
        unlockRequirements: JSON.stringify({ activity: 'profile-setup' }),
      },
    }),
    prisma.collectible.create({
      data: {
        slug: 'reblog-rose',
        name: 'Reblog Rose',
        description: 'A pastel, reblog-ready keepsake from the 2010s social scrapbook era.',
        category: 'badge',
        eraId: createdEras[1].id,
        rarity: 'uncommon',
        assetReference: 'badge-reblog',
        unlockRequirements: JSON.stringify({ activity: 'meme-post' }),
      },
    }),
    prisma.collectible.create({
      data: {
        slug: 'chaos-diploma',
        name: 'Chaos Diploma',
        description: 'Awarded to anyone who survived the absurd trends of the 2020s.',
        category: 'achievement',
        eraId: createdEras[2].id,
        rarity: 'rare',
        assetReference: 'badge-chaos',
        unlockRequirements: JSON.stringify({ activity: 'brainrot-completion' }),
      },
    }),
  ]);

  await prisma.activityDefinition.createMany({
    data: [
      {
        slug: 'profile-setup',
        title: 'Profile Setup',
        description: 'Create a personal profile and save your initial desktop experience.',
        activityType: 'PROFILE',
        eraId: createdEras[0].id,
        requirements: JSON.stringify({ minActions: 1 }),
        collectibleUnlocks: JSON.stringify([collectibles[0].id]),
      },
      {
        slug: 'meme-post',
        title: 'Meme Post',
        description: 'Bookmark a fictional channel and share a reaction in the era-specific feed.',
        activityType: 'DISCOVERY',
        eraId: createdEras[1].id,
        requirements: JSON.stringify({ minActions: 1 }),
        collectibleUnlocks: JSON.stringify([collectibles[1].id]),
      },
      {
        slug: 'brainrot-completion',
        title: 'Brainrot Completion',
        description: 'Complete a surreal mini-trend run and explore the chaotic archive.',
        activityType: 'COMPLETION',
        eraId: createdEras[2].id,
        requirements: JSON.stringify({ minActions: 2 }),
        collectibleUnlocks: JSON.stringify([collectibles[2].id]),
      },
    ],
  });

  await prisma.contentItem.createMany({
    data: [
      {
        slug: 'welcome-to-glitter-dialup',
        title: 'Welcome to Glitter Dialup',
        body: 'A cheerful early internet portal waiting to be explored.',
        contentType: 'article',
        eraId: createdEras[0].id,
        tags: JSON.stringify(['welcome', 'glossy', 'retro']),
        assetRefs: JSON.stringify(['pixel-banner']),
        status: 'published',
      },
      {
        slug: 'microblog-energy',
        title: 'Microblog Energy',
        body: 'The odd little rituals of a scrapbook-era social feed.',
        contentType: 'article',
        eraId: createdEras[1].id,
        tags: JSON.stringify(['social', 'meme', 'tumblr']),
        assetRefs: JSON.stringify(['soft-collage']),
        status: 'published',
      },
      {
        slug: 'fractal-chaos-manifest',
        title: 'Fractal Chaos Manifest',
        body: 'A surreal document from a time when every trend felt slightly unhinged.',
        contentType: 'article',
        eraId: createdEras[2].id,
        tags: JSON.stringify(['brainrot', 'chaos', 'trend']),
        assetRefs: JSON.stringify(['neon-archive']),
        status: 'published',
      },
    ],
  });

  const user = await prisma.user.create({
    data: {
      displayName: 'Guest Archivist',
      email: 'guest@example.com',
      passwordHash: '$2a$10$8AlEAE7pZZP9Wj63vX6Uq.Ns3LW5vLec4p2gWMx5.zjTnXvOQHqXm',
    },
  });

  await prisma.userSettings.create({
    data: {
      userId: user.id,
      preferredEraId: createdEras[0].id,
      theme: 'classic',
      accessibilityMode: 'standard',
      soundEnabled: true,
      animationEnabled: true,
      wallpaper: 'classic-grid',
      language: 'en',
    },
  });

  await prisma.desktopConfiguration.create({
    data: {
      userId: user.id,
      wallpaper: 'classic-grid',
      theme: 'classic',
      layout: JSON.stringify([{ id: 'pixelchat', x: 20, y: 30, width: 320, height: 220 }]),
      iconArrangement: JSON.stringify([{ id: 'pixelchat', x: 10, y: 20 }]),
      appPreferences: JSON.stringify({ pixelchat: { compact: false } }),
      configurationVersion: 1,
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: user.id,
      eraId: createdEras[0].id,
      progress: JSON.stringify({ visited: true, completion: 0.25 }),
      completedActivities: JSON.stringify(['profile-setup']),
      lastActivityAt: new Date(),
      metadata: JSON.stringify({ startedFrom: 'guest-archive' }),
    },
  });

  await prisma.userCollectible.create({
    data: {
      userId: user.id,
      collectibleId: collectibles[0].id,
      acquisitionSource: 'profile-setup',
      metadata: JSON.stringify({ source: 'welcome' }),
    },
  });

  console.log('Database seeded with three eras, sample applications, collectibles, and content.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
