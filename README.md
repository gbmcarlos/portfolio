# Portfolio

## Updating dependencies
Whenever you want to update the dependencies, delete the lock file (`Gemfile.lock`), run the project again (with `up.sh` or `local.up.sh`)(this will update the dependencies and write the lock file inside the container) and extract the lock files from inside the container with:
```
$ docker cp obelix:/var/www/Gemfile.lock .
```