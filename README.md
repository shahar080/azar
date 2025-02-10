### Built With

* <a href="https://vite.dev">Vite</a>
* <a href="https://react.dev">React</a>
* <a href="https://mui.com/material-ui">MaterialUI</a>
* <a href="https://maven.apache.org/">Maven</a>
* <a href="https://www.java.com/en/">Java</a>
* <a href="https://vertx.io/">Vert.x</a>

<!-- PREREQUISITES -->

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```
* Java 23
* Java IDE
* Maven

### Installation

1. Clone the repo
   ```sh
   git clone git@bitbucket.org:Shahar0080/azar.git
   ```
2. Client setup:
    1. Move to the client directory
       ```sh
       cd azar-cloud
       ```
    2. Install NPM packages
       ```sh
       npm install
       ```
    3. Run the client
       ```sh
       npm run dev
       ```
3. Server setup:
    1. Open your IDE
    2. Open ```azar-server```
    3. Use maven to download dependencies
    4. Define environment properties as set in the server environment variables section below
    5. Run ```AzarLauncher.java```

<!-- SERVER ENVIRONMENT VARIABLES -->

### Server Environment Variables

| **Setting**                | **Description**                                                                       |
|----------------------------|---------------------------------------------------------------------------------------|
| `ALLOWED_ORIGINS`          | The allowed origins that will the server handle requests from, separated by comma(,). |
| `HIBERNATE_CFG_FILE_PATH`  | The hibernate config file path.                                                       |
| `IS_DEV`                   | Is development.                                                                       |
| `JWT_SECRET_KEY`           | JWT Secret key for token creation.                                                    |
| `OPEN_WEATHER_MAP_API_KEY` | API key for OpenWeatherMap in-order to get weather data.                              |
| `PROPERTIES_FILE_PATH`     | The properties file path.                                                             |

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->

## Contact

[Shahar Azar](https://www.linkedin.com/in/shahar-azar/) - shahar.azar2@gmail.com

[Bitbucket - AzarCloud](https://bitbucket.org/Shahar0080/azar/src/main/)
