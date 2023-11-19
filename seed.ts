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
    ],
  });

  prisma.$on("query", (e) => {
    console.log(e.query);
    console.log(e.params);
  });

  // create 1000 artists and 100000 artworks
  const artists: Prisma.ArtistCreateInput[] = new Array(1000)
    .fill(0)
    .map<Prisma.ArtistCreateInput>((_, i) => ({
      name: `Artist ${i}`,
      birthCity: `City ${i}`,
      birthCountry: `Country ${i}`,
      birthDate: randomDate(new Date(1900, 0, 1), new Date(2023, 0, 1)),
      works: {
        create: new Array(1000).fill(0).map<Prisma.WorkCreateInput>((_, j) => ({
          artwork: {
            create: {
              title: `Artwork ${j}`,
              height: j + 1,
              width: j + 1,
              image: "https://www.example.com/image.jpg",
              date: randomDate(new Date(1900, 0, 1), new Date(2023, 0, 1)),
            },
          },
          artist: {
            connect: {
              id: i + 1,
            },
          },
        })),
      },
    }));

  await prisma.artist.createMany({
    data: artists,
    skipDuplicates: true,
  });
}

seed().catch((e) => {
  console.error(e);
});
