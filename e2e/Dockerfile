# e2e test image for ctxrun.
#
# Simulates the real-world scenario the tool targets: a regular user
# ("devuser") with Git/GitHub CLI/SSH/cloud config in their home directory,
# who then runs `sudo ctxrun <preset>`. The test scripts assert that the
# child process sees devuser's context, not root's.
#
# Also creates "ciuser" — a second user for profile-override tests.
FROM debian:12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       curl ca-certificates gnupg sudo git socat \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

# Primary dev user — represents the "real" developer running ctxrun via sudo.
RUN useradd -m -s /bin/bash devuser \
  && echo "devuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/devuser \
  && chmod 0440 /etc/sudoers.d/devuser

# Secondary user — used for --profile override tests.
RUN useradd -m -s /bin/bash ciuser \
  && echo "ciuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ciuser \
  && chmod 0440 /etc/sudoers.d/ciuser

WORKDIR /opt/ctxrun
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci \
  && npm run build \
  && npm link

# ── devuser home setup ────────────────────────────────────────────────────────
# Seed devuser's home with fake config files so plugin checks resolve "ok"
# instead of "warn", and so we can assert the actual file contents/paths.
USER devuser
WORKDIR /home/devuser
RUN mkdir -p \
      ~/.config/gh ~/.aws ~/.kube ~/.docker ~/.config/gcloud \
      ~/.config/pip ~/.cargo ~/.rustup ~/.codex ~/.gemini ~/.claude ~/.npm \
      ~/.config/ctxrun \
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

# ── ciuser home setup ─────────────────────────────────────────────────────────
# ciuser has minimal config — used for profile override tests.
USER ciuser
WORKDIR /home/ciuser
RUN mkdir -p \
      ~/.config/gh ~/.aws ~/.kube \
  && git config --global user.name "CI User" \
  && git config --global user.email "ci@example.com" \
  && printf 'apiVersion: v1\nkind: Config\n' > ~/.kube/config

# ── SSH socket simulation ─────────────────────────────────────────────────────
# Create a fake SSH agent socket for devuser so ssh.agent check resolves [ok].
# We use socat to listen on the socket path and keep it alive.
USER root
RUN mkdir -p /run/ssh-agent \
  && chown devuser:devuser /run/ssh-agent

# Write a startup script that creates the SSH socket before tests run.
RUN printf '#!/bin/bash\n# Create a fake SSH agent socket so ssh.agent check reports [ok]\nsocat UNIX-LISTEN:/run/ssh-agent/S.sock,fork /dev/null &\nexport SSH_AUTH_SOCK=/run/ssh-agent/S.sock\nexec "$@"\n' \
    > /usr/local/bin/with-ssh-socket \
  && chmod +x /usr/local/bin/with-ssh-socket

WORKDIR /opt/ctxrun

COPY e2e/scenarios ./e2e/scenarios
COPY e2e/run-e2e.sh e2e/lib.sh ./e2e/
RUN chmod +x ./e2e/run-e2e.sh ./e2e/scenarios/*.sh

ENTRYPOINT ["/opt/ctxrun/e2e/run-e2e.sh"]
