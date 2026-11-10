TURBO = TURBO_TELEMETRY_DISABLED=1 turbo
i18n = ./src/i18n

precommit:
	npm run lint
	npm audit

requirements:
	npm ci

# turbo.site.json is the standalone turbo config for this package.  It is
# renamed to avoid conflicts with turbo v2's workspace validation, which
# rejects root task syntax (//#) and requires "extends" in package-level
# turbo.json files, such as when running in a site repository. The targets
# below copy it into place before running turbo and clean up after.
turbo.json: turbo.site.json
	cp $< $@

# NPM doesn't bin-link workspace packages during install, so it must be done manually.
bin-link:
	[ -f packages/frontend-base/package.json ] && npm rebuild --ignore-scripts @openedx/frontend-base || true

build-packages: turbo.json
	$(TURBO) run build; rm -f turbo.json
	$(MAKE) bin-link

clean-packages: turbo.json
	$(TURBO) run clean; rm -f turbo.json

dev-packages: build-packages turbo.json
	$(TURBO) run watch:build dev:site; rm -f turbo.json

dev-site: bin-link
	npm run dev

extract_translations: | requirements
	npm run i18n_extract

# Despite the name, we actually need this target to detect changes in the incoming translated message files as well.
detect_changed_source_translations:
	# Checking for changed translations...
	git diff --exit-code $(i18n)

# Pulls translations using atlas.
pull_translations: | requirements
	npm run translations:pull -- --atlas-options="$(ATLAS_OPTIONS)"

clean:
	rm -rf dist

build:
	tsc --project tsconfig.build.json
	find src -type f \( -name '*.scss' -o -path '*/assets/*' \) -exec sh -c '\
	  for f in "$$@"; do \
	    d="dist/$${f#src/}"; \
	    mkdir -p "$$(dirname "$$d")"; \
	    cp "$$f" "$$d"; \
	  done' sh {} +
	tsc-alias -p tsconfig.build.json

build-ci:
	SITE_CONFIG_PATH=site.config.ci.tsx openedx build
