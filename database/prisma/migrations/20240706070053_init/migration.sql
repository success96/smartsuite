-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "_OrganisationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganisationToUser_AB_unique" ON "_OrganisationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganisationToUser_B_index" ON "_OrganisationToUser"("B");

-- AddForeignKey
ALTER TABLE "_OrganisationToUser" ADD CONSTRAINT "_OrganisationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Organisation"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganisationToUser" ADD CONSTRAINT "_OrganisationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
