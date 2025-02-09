#
# Build stage
#
FROM maven:3.9.9-eclipse-temurin-23 AS build

# Set working directory inside the build container
WORKDIR /home/app

# Copy the project files (source code and pom.xml)
COPY src /home/app/src
COPY pom.xml /home/app/

# Run the Maven build
RUN mvn clean package

#
# Package stage
#
FROM openjdk:23-jdk-slim

# Set working directory inside the final container
WORKDIR /app

# Copy the generated jar from the build container
COPY --from=build /home/app/target/azar-1.0-jar-with-dependencies.jar /app/

# Expose the port Vert.x will run on
EXPOSE 8080

# Run the Vert.x server
CMD ["java", "-jar", "/app/azar-1.0-jar-with-dependencies.jar"]