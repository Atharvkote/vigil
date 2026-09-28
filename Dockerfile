FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy the pom.xml and source code
COPY app/server/pom.xml .
COPY app/server/src ./src
COPY app/server/.mvn ./.mvn
COPY app/server/mvnw .
COPY app/server/mvnw.cmd .

# Ensure the wrapper is executable
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
