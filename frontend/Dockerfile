FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configuration
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Set building environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js production output
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
