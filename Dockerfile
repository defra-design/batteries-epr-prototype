ARG PARENT_VERSION=2.8.5-node22.16.0
ARG PORT=3010
ARG PORT_DEBUG=9229

FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ENV TZ="Europe/London"

ARG PORT
ARG PORT_DEBUG
ENV PORT=${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

USER root
RUN npm install -g pnpm@11
USER node

COPY --chown=node:node --chmod=755 package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node --chmod=755 . .

CMD [ "pnpm", "run", "dev" ]

FROM development AS production_build

ENV NODE_ENV=production

RUN pnpm run build:frontend

FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ENV TZ="Europe/London"

USER root
RUN apk add --no-cache curl
RUN npm install -g pnpm@11
USER node

COPY --from=production_build /home/node/package.json /home/node/pnpm-lock.yaml /home/node/pnpm-workspace.yaml ./
COPY --from=production_build /home/node/src ./src/
COPY --from=production_build /home/node/.public/ ./.public/

RUN pnpm install --prod --frozen-lockfile

ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD [ "node", "src" ]
