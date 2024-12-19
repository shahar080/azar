FROM openjdk:23-jdk-slim

# Set the working directory
WORKDIR /app

# Copy your Vert.x jar and properties/config files into the container
COPY target/azar-1.0-jar-with-dependencies.jar /app/

# Copy SSL certificates (if needed)
COPY ./ssl/cert.pem /etc/ssl/certs/cert.pem
COPY ./ssl/key.pem /etc/ssl/private/key.pem

# Expose the port Vert.x will run on
EXPOSE 8080

# Run the Vert.x server
CMD ["java", "-jar", "azar-1.0-jar-with-dependencies.jar"]
