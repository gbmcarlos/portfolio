#!/bin/sh

read -p "Project name: " PROJECT_NAME </dev/tty

if [ -d ${PROJECT_NAME} ]; then
    echo "Folder with name '${PROJECT_NAME}' already exists"
    exit 2
fi

read -p "Github username: " GITHUB_USERNAME < /dev/tty

echo "Downloading Skellington repo..."

# Make the directory for the new project and step into it
mkdir ${PROJECT_NAME} && cd ${PROJECT_NAME}

# Download Skellington's tarball and untar in the new folder
curl -s -L https://github.com/gbmcarlos/skellington/tarball/lumen | tar xz --strip 1

echo "Preparing ${PROJECT_NAME}..."

# Delete files and folders
rm -f installer.sh .gitmodules
rm -rf src/toolkit

# Replace with the new project name
sed -i '' -e "s/skellington/${PROJECT_NAME}/g" config/nginx.conf
sed -i '' -e "s/skellington/${PROJECT_NAME}/g" composer.json

# Initialize the git repo
## Set the remote if a GitHub username was provided
git init > /dev/null
if [ ! -z ${GITHUB_USERNAME} ]; then
    git remote add origin git@github.com:${GITHUB_USERNAME}/${PROJECT_NAME}.git
fi

# Write the project name as a title in README.md and commit it
echo "#" ${PROJECT_NAME} > README.md
git add README.md
git commit -m "Initial commit"  > /dev/null

# Commit the project's skeleton
## Stage everything but src/app
git add .
git reset -- src/app
git commit -m "Project skeleton created by Skellington" > /dev/null

echo "Installing Toolkit..."

# Install Toolkit
git submodule add --quiet git@github.com:gbmcarlos/toolkit.git src/toolkit > /dev/null
git add .gitmodules
git add src/toolkit
git commit -m "Installed Toolkit" > /dev/null

echo "Installing Composer dependencies..."

# Deploy locally and extract composer.lock
make api > /dev/null
docker cp ${PROJECT_NAME}:/var/task/composer.lock .
git add composer.lock
git commit -m "Installed composer dependencies" > /dev/null

echo "Finished! ${PROJECT_NAME} is now ready"