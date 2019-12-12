transifex_resource = frontend-template-application
transifex_langs = "ar,fr,es_419,zh_CN"

transifex_utils = ./node_modules/.bin/transifex-utils.js
i18n = ./src/i18n
transifex_input = $(i18n)/transifex_input.json
tx_url1 = https://www.transifex.com/api/2/project/edx-platform/resource/$(transifex_resource)/translation/en/strings/
tx_url2 = https://www.transifex.com/api/2/project/edx-platform/resource/$(transifex_resource)/source/

# This directory must match .babelrc .
transifex_temp = ./temp/babel-plugin-react-intl

precommit:
	npm run lint
	npm audit

requirements:
	npm install

i18n.extract:
	# Pulling display strings from .jsx files into .json files...
	rm -rf $(transifex_temp)
	npm run-script i18n_extract

i18n.concat:
	# Gathering JSON messages into one file...
	$(transifex_utils) $(transifex_temp) $(transifex_input)

extract_translations: | requirements i18n.extract i18n.concat

# Despite the name, we actually need this target to detect changes in the incoming translated message files as well.
detect_changed_source_translations:
	# Checking for changed translations...
	git diff --exit-code $(i18n)

# Pushes translations to Transifex.  You must run make extract_translations first.
push_translations:
	# Pushing strings to Transifex...
	tx push -s
	# Fetching hashes from Transifex...
	./node_modules/reactifex/bash_scripts/get_hashed_strings.sh $(tx_url1)
	# Writing out comments to file...
	$(transifex_utils) $(transifex_temp) --comments
	# Pushing comments to Transifex...
	./node_modules/reactifex/bash_scripts/put_comments.sh $(tx_url2)

# Pulls translations from Transifex.
pull_translations:
	tx pull -f --mode reviewed --language=$(transifex_langs)

# This target is used by Travis.
validate-no-uncommitted-package-lock-changes:
	# Checking for package-lock.json changes...
	git diff --exit-code package-lock.json
