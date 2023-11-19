import { Artist, Prisma, PrismaClient } from "@prisma/client";

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function seed() {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
    ],
  });

  prisma.$on("query", (e) => {
    console.log(e.query);
    console.log(e.params);
  });

  prisma.$on("error", (e) => {
    console.error(e);
  });

  await prisma.$queryRawUnsafe(
    `TRUNCATE "Work", "Artwork", "Artist" RESTART IDENTITY`
  );

  // create 1000 artists and 100000 artworks
  const artists: Prisma.ArtistCreateInput[] = new Array(10000)
    .fill(0)
    .map<Prisma.ArtistCreateInput>((_, i) => ({
      name: `Artist ${i}`,
      birthCity: `City ${i}`,
      birthCountry: `Country ${i}`,
      birthDate: randomDate(new Date(1900, 0, 1), new Date(2023, 0, 1)),
    }));

  await prisma.artist.createMany({
    data: artists,
    skipDuplicates: true,
  });

  const artworks: Prisma.ArtworkCreateInput[] = new Array(10000)
    .fill(0)
    .map<Prisma.ArtworkCreateInput>((_, i) => ({
      title: `Artwork ${i}`,
      height: Math.floor(Math.random() * 1000) + 1,
      width: Math.floor(Math.random() * 1000) + 1,
      image: "https://www.example.com/image.jpg",
      date: randomDate(new Date(1900, 0, 1), new Date(2023, 0, 1)),
    }));

  await prisma.artwork.createMany({
    data: artworks,
    skipDuplicates: true,
  });

  await prisma.work.createMany({
    data: new Array(1000).fill(0).map((_, i) => ({
      artworkId: i + 1,
      artistId: Math.floor(Math.random() * 1000) + 1,
    })),
    skipDuplicates: true,
  });
}

await seed().catch((e) => {
  console.error(e);
});
