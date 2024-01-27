##################################################
# devcontainer: for dev use
FROM fedora:39 AS devcontainer

# Install and update system dependencies, plus up-to-date node/npm
COPY .devcontainer/packages.txt /opt/packages.txt
RUN dnf install -y $(cat /opt/packages.txt) && \
    rm -rf /var/cache/dnf && \
    npm i -g node npm

# Set up the devcontainer user
RUN useradd -ms /bin/bash developer
RUN echo "developer ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/developer
WORKDIR /home/developer
USER developer
# All commands from here on out are as 'developer' user

# Set up bashrc
COPY --chown=developer .devcontainer/bashrc.d /home/developer/.bashrc.d

# Ensure permissions for developer user's dir
RUN chown developer -R /home/developer

CMD echo "devcontainer started" && sleep infinity

##################################################
# default: does nothing, just serves as the default for a target-less build
FROM fedora:39 AS default
CMD echo "default container does nothing"