# Portfolio

## Environment variables available
These environment variables are given a default value in the `up.sh` and `local.up.sh` (host) scripts, and also in the `configure.sh` and `entrypoint.sh` (container) scripts. The default value in any of the host scripts will override the default value in the container scripts.

|       ENV VAR        |                 Default value                 |        Description        |
| -------------------- | --------------------------------------------- | ------------------------- |
| PROJECT_NAME         | Name of the project's root folder (`localhost` in the container scripts)  | Used to name the docker image and docker container from the `up.sh` files, and as the name server in nginx. |
| HOST_PORT            | 80                                                                        | The port Docker will use as the host port in the network bridge. This is the external port, the one your app will be called through. |
| BASIC_AUTH_ENABLED   | `true` (`false` in `local.up.sh`)                                         | Enables Basic Authentication with Nginx. |
| BASIC_AUTH_USERNAME  | admin                                                                     | If `BASIC_AUTH_ENABLED` is `true`, it will be used to run `htpasswd` together with `BASIC_AUTH_PASSWORD` to encrypt with bcrypt (cost 10). |
| BASIC_AUTH_PASSWORD  | `PROJECT_NAME`_password                                                   | If `BASIC_AUTH_ENABLED` is `true`, it will be used to run `htpasswd` together with `BASIC_AUTH_USERNAME` to encrypt with bcrypt (cost 10). |

Example:  
```
HOST_PORT=8000 BASIC_AUTH_ENABLED=true BASIC_AUTH_USER=user BASIC_AUTH_PASSWORD=secure_password ./deploy/local.up.sh
```

You can also run the container yourself and override the container's command to run a different process instead of the normal application and web server:    
```
docker run --name other-container --rm -v $PWD/src:/var/www/src --rm -w /var/www -e PROJECT_NAME=portfolio portfolio:latest /bin/sh -c "/var/www/configure.sh && ruby -v"
```

## Watch content
To watch the content (see the compiled changes instantly reflect after every change) run 
```bash
docker exec -w /var/www portfolio /bin/sh -c "jekyll build --source /var/www/src --destination /var/www/src/public --watch"
```

## Updating dependencies
Whenever you want to update the dependencies, delete the lock file (`Gemfile.lock`), run the project again (with `up.sh` or `local.up.sh`)(this will update the dependencies and write the lock file inside the container) and extract the lock files from inside the container with:
```
docker cp portfolio:/var/www/Gemfile.lock .
```