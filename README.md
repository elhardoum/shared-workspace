# Shared Workspace SODV1201 Term Project

## Deploying with Docker

### Prerequisites

`docker` and `docker-compose`: Make sure you have docker engine installed. If not, visit [https://docs.docker.com/engine/install](https://docs.docker.com/engine/install) and follow the installation steps for your platform.

Next, [install](https://docs.docker.com/compose/install/) `docker-compose`

### Usage

First, make sure you set the environment variables:

```sh
test -f .env || cp .env.sample .env
```

Now edit `.env` and enter the configurations.

```sh
# cd to the root of this project.

# first time, build the containers
docker-compose build

# run the containers in detached mode
docker-compose up -d
```

Now you can access the web service at

*http://{machine_ip}:{HTTP_PORT}*
 - `{machine_ip}` is your current ip, `curl ipv4.icanhazip.com` to get the IP.
 - `{HTTP_PORT}` HTTP port configured in the `.env` file, 8995 in the sample env (look for `HTTP_PORT`)

So if your local ip is 127.0.0.1, and the port configured is 8995, you can access the service at `http://127.0.0.1:8995`

### Notes

 - Every time you make changes to `.env`, make sure you restart the containers `docker-compose up -d --force-recreate`
