# Azar

Azar is a monorepo project that consists of a web client and a server. The client is a modern, responsive web application, while the server provides a robust set of APIs to support it.

## Overview

The Azar project is a comprehensive web application with a variety of features. The client is built with React and Material-UI, providing a clean and intuitive user experience. The server is a Quarkus application that exposes a RESTful API to manage the application's data and business logic.

## Features

*   **Who Am I:** A personal section for managing CVs and other personal information.
*   **Gallery:** A photo gallery that supports metadata, thumbnails, and heatmaps.
*   **Weather:** A weather module that provides forecasts based on location.
*   **Cloud:** A cloud platform for user management, preferences, and PDF document handling.

## Technology Stack

### Client (`azar-client`)

*   **Framework:** [Vite](https://vitejs.dev/) with [React](https://react.dev/)
*   **UI:** [Material-UI](https://mui.com/material-ui/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

### Server (`azar-server`)

*   **Framework:** [Quarkus](https://quarkus.io/)
*   **Language:** [Java](https://www.java.com/en/)
*   **Build Tool:** [Maven](https://maven.apache.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)

## Prerequisites

*   npm
    ```sh
    npm install npm@latest -g
    ```
*   Java 21
*   A Java IDE
*   Maven

## Installation

1.  Clone the repo
    ```sh
    git clone git@bitbucket.org:Shahar0080/azar.git
    ```
2.  Client setup:
    1.  Move to the client directory
        ```sh
        cd azar-client
        ```
    2.  Install NPM packages
        ```sh
        npm install
        ```
    3.  Run the client
        ```sh
        npm run dev
        ```
3.  Server setup:
    1.  Open the `azar-server` directory in your IDE.
    2.  Build the project using Maven:
        ```sh
        mvn clean install
        ```
    3.  Run the application using Quarkus:
        ```sh
        mvn quarkus:dev
        ```

## Server Environment Variables

The following environment variables can be set to configure the server:

| Setting | Description |
| --- | --- |
| `AZAR_OPEN_WEATHER_API_KEY` | API key for OpenWeatherMap to get weather data. |
| `AZAR_MAP_BOX_API_KEY` | API key for MapBox. |
| `MP_JWT_VERIFY_ISSUER` | The expected issuer of the JWT. |
| `AZAR_JWT_MINUTES_DURATION` | The duration of the JWT in minutes. |

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
