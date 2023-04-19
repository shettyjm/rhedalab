FROM registry.access.redhat.com/ubi8/nodejs-18 as builder

# Add application sources
WORKDIR $HOME

# Install the dependencies
COPY package*.json ./

RUN npm install


COPY . .
RUN ls -ltr
RUN pwd

# Second stage copies the application to the minimal image
FROM registry.access.redhat.com/ubi8/nodejs-18

# Copy the application source and build artifacts from the builder image to this one
COPY --from=builder $HOME $HOME

# Run script uses standard ways to run the application
EXPOSE 3000
CMD npm run -d start