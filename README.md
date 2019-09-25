## Application Structure
* **entities**: The data structures that the application is all about.
* **services**: Core functionality that the application provides.
* **adapters**: Functions for converting Entities to and from their third-party Equivalents. Adapters are an important part of [Dependency Inversion](https://stackify.com/dependency-inversion-principle/), which is a guiding principle in this application.
* **tests**: Modules that simulate application input, and check for expected output.

## Getting Production Ready
* `chmod +x enable-ssl.sh`
* `./enable-ssl.sh`

## Commands
* Install dependencies:
  * With node installed: `npm --prefix app install`
  * With docker installed: `docker run -it --rm -v $(pwd)/app:/app -w /app node:12 npm install`
* Run tests: (must install dependencies first)
  * With node installed: `npm --prefix app run test`
  * With docker installed: `docker run -it --rm -v $(pwd)/app:/app -w /app node:12 npm run test`
* Start application (development):
  * `docker-compose up -d`
* Start application (production):
  * `docker-compose -f docker-compose.production.yml up -d`
* Restart in production: (For updates)
  * `docker-compose restart -d`
* List running docker containers:
  * `docker ps`
