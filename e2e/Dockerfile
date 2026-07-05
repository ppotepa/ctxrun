# e2e test image for ctxrun.
#
# Simulates the real-world scenario the tool targets: a regular user
# ("devuser") with Git/GitHub CLI/SSH/cloud config in their home directory,
# who then runs `sudo ctxrun <preset>`. The test scripts assert that the
# child process sees devuser's context, not root's.
FROM debian:12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       curl ca-certificates gnupg sudo git \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

# Non-root user representing the "real" developer.
RUN useradd -m -s /bin/bash devuser \
  && echo "devuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/devuser \
  && chmod 0440 /etc/sudoers.d/devuser

WORKDIR /opt/ctxrun
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci \
  && npm run build \
  && npm link

# Seed devuser's home with fake config files so plugin checks resolve "ok"
# instead of "warn", and so we can assert the actual file contents/paths.
USER devuser
WORKDIR /home/devuser
RUN mkdir -p \
      ~/.config/gh ~/.aws ~/.kube ~/.docker ~/.config/gcloud \
      ~/.config/pip ~/.cargo ~/.rustup ~/.codex ~/.gemini ~/.claude ~/.npm \
  && git config --global user.name "Dev User" \
  && git config --global user.email "dev@example.com" \
  && printf 'hosts:\n  github.com:\n    oauth_token: fake-token\n' > ~/.config/gh/hosts.yml \
  && printf '[default]\naws_access_key_id=FAKE\naws_secret_access_key=FAKE\n' > ~/.aws/credentials \
  && printf '[default]\nregion=us-east-1\n' > ~/.aws/config \
  && printf '[global]\nindex-url=https://example.invalid/simple\n' > ~/.config/pip/pip.conf \
  && printf 'apiVersion: v1\nkind: Config\n' > ~/.kube/config \
  && printf '{}\n' > ~/.docker/config.json \
  && printf 'devuser@example.com\n' > ~/.config/gcloud/active_config \
  && touch ~/.npmrc

USER root
WORKDIR /opt/ctxrun

COPY e2e/scenarios ./e2e/scenarios
COPY e2e/run-e2e.sh e2e/lib.sh ./e2e/
RUN chmod +x ./e2e/run-e2e.sh ./e2e/scenarios/*.sh

ENTRYPOINT ["/opt/ctxrun/e2e/run-e2e.sh"]
