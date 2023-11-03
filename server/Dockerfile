# Dockerfile
FROM --platform=linux/amd64 node:alpine

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake \
    gcompat

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the entire monorepo
COPY . .

# Install dependencies for shared-lib
WORKDIR /usr/src/app/packages/shared-lib
RUN yarn

# Install dependencies for server
WORKDIR /usr/src/app/packages/ui/server
RUN yarn

WORKDIR /usr/src/app

# Expose the port the server listens on
EXPOSE 3020

# Command to run the server
CMD ["yarn", "server"]

