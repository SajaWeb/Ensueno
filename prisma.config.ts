import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://ensueno:aX2DKbHldtM0xuC1eApi@76.13.113.31:5434/ensuenodb?sslmode=disable',
  },
});
