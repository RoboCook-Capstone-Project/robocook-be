import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.create({
        data: {
            email: "elsa@prisma.io",
            name: "Elsa Prisma",
            posts: {
                create: [
                    { title: "How to make an omelette" },
                    { title: "How to eat an omelette" },
                ],
            },
        },
        include: {
            posts: true, // Include all posts in the returned object
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
    });
