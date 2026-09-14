// Re-exported so DTOs don't need to import the generated Prisma client type
// directly (keeps DTO validation decoupled from `prisma generate` having run).
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}
