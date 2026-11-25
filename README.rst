#####################
frontend-app-learning
#####################

|license-badge| |ci-badge| |codecov| |semantic-release|

Learning is a `frontend-base`_ app: a library that a site plugs into the Open
edX frontend shell, not a standalone micro-frontend with its own webpack build.
It is published to NPM as ``@openedx/frontend-app-learning``.

.. _frontend-base: https://github.com/openedx/frontend-base

*******
Purpose
*******

This app renders the learner-facing pages of a course: the course home and its
outline, the dates, progress and live tabs, and the courseware itself, where
learners work through units.

*********************
Branches and Releases
*********************

This app is published to NPM by ``semantic-release``. Its branches follow
`OEP-10 ADR 0002`_:

``master``
  Unstable. Every merge publishes a prerelease on the ``alpha`` dist-tag.
  Breaking changes land here with no DEPR process and no warning, so it is not
  supported in production. All changes, including bug fixes, should target
  this branch first.

``stable``
  Will carry the newest stable major and own the ``latest`` dist-tag. It has
  not been cut yet.

``n.x`` and ``n.m.x``
  Maintenance branches for majors and minors that ``stable`` has moved past.
  Each owns the dist-tag matching its own name.

The first release is ``1.0.0-alpha.1``, on the ``alpha`` dist-tag. Both
``.releaserc`` and the ``Release CI`` workflow already know the whole layout,
so a new line starts publishing as soon as its branch is pushed.

The legacy micro-frontend lives on in the `legacy-mfe`_ branch, cut from the
last commit before this conversion. Open edX releases that still ship the
micro-frontend are cut from there.

.. _OEP-10 ADR 0002: https://docs.openedx.org/projects/openedx-proposals/en/latest/processes/oep-0010/decisions/0002-frontend-stable-branches.html
.. _legacy-mfe: https://github.com/openedx/frontend-app-learning/tree/legacy-mfe

***************
Getting Started
***************

Prerequisites
=============

A running Open edX instance serves this app's backend APIs. `Tutor`_ in
development mode is the usual choice, and ``site.config.dev.tsx`` already
points at its default hostnames.

.. _Tutor: https://github.com/overhangio/tutor

Cloning and Startup
===================

1. Clone the repo:

   ``git clone https://github.com/openedx/frontend-app-learning.git``

2. Use the version of Node specified in the ``.nvmrc`` file.

   Other major versions of Node *may* work, but they are unsupported. The
   ``.nvmrc`` file helps set the right version via
   `nvm <https://github.com/nvm-sh/nvm>`_.

3. Install npm dependencies:

   ``cd frontend-app-learning && npm ci``

4. Start the dev server:

   ``npm run dev``

The dev server runs with ``PORT=2000 PUBLIC_PATH=/learning`` (set in the
``dev`` script in ``package.json``) and is available at
`http://apps.local.openedx.io:2000/learning <http://apps.local.openedx.io:2000/learning>`_.
It uses the site defined in ``site.config.dev.tsx``.

Local Development Against ``frontend-base``
===========================================

To develop this app and a local checkout of ``frontend-base`` together, use the
built-in npm workspace support:

.. code-block:: sh

    mkdir -p packages/frontend-base
    sudo mount --bind /path/to/frontend-base packages/frontend-base
    npm install
    npm run dev:packages

Bind mounts are used instead of symlinks because Node resolves symlinks to
their real paths, which breaks hoisted dependency resolution. When you are
done, unmount with ``sudo umount packages/frontend-base``.

******************************
Composing Learning into a Site
******************************

A site adds Learning by importing ``learningApp`` and listing it in its site
config's ``apps``, next to the shell, header and footer apps.
``site.config.dev.tsx`` in this repository is a complete example:

.. code-block:: tsx

    import { learningApp } from '@openedx/frontend-app-learning';

    const siteConfig: SiteConfig = {
      // ...
      apps: [
        shellApp,
        headerApp,
        footerApp,
        learningApp,
      ],
    };

Sites that build their own route tree can use the exported ``learningRoutes``
instead.

Configuration
=============

This app is not configured by build-time environment variables any more. It
reads its settings from app config. A site sets them in ``commonAppConfig``,
which applies to every app on the site, or in the app's own ``config``, which
wins:

.. code-block:: tsx

    apps: [
      // ...
      { ...learningApp, config: { SUPPORT_URL: 'https://support.example.com' } },
    ],

These are the keys Learning reads. All are unset by default, except
``SHOW_UNGRADED_ASSIGNMENT_PROGRESS``, which is ``false``. Where a URL is
unset, the link it feeds is left out.

- ``CONTACT_URL``
- ``CREDENTIALS_BASE_URL``
- ``CREDIT_HELP_LINK_URL``
- ``DISCOUNT_CODE_INFO_URL``
- ``DISCOVERY_API_BASE_URL``
- ``ECOMMERCE_BASE_URL``
- ``ENABLE_NOTICES``
- ``ENTERPRISE_LEARNER_PORTAL_URL``
- ``EXAMS_BASE_URL``
- ``LEGACY_THEME_NAME``
- ``MARKETING_SITE_BASE_URL``
- ``PROCTORED_EXAM_FAQ_URL``
- ``PROCTORED_EXAM_RULES_URL``
- ``SESSION_COOKIE_DOMAIN``
- ``SHOW_UNGRADED_ASSIGNMENT_PROGRESS``
- ``SOCIAL_UTM_MILESTONE_CAMPAIGN``
- ``SUPPORT_URL``
- ``SUPPORT_URL_CALCULATOR_MATH``
- ``SUPPORT_URL_ID_VERIFICATION``
- ``SUPPORT_URL_VERIFIED_CERTIFICATE``
- ``TERMS_OF_SERVICE_URL``
- ``TWITTER_HASHTAG``
- ``TWITTER_URL``

Learning does not take other apps' URLs as config keys. It links to them by
route role, such as ``org.openedx.frontend.role.dashboard`` or
``org.openedx.frontend.role.profile`` (the full list is in
``src/constants.ts``). A role resolves to an installed app's route, or to an
entry in the site config's ``externalRoutes``. ``site.config.dev.tsx`` declares
them as external routes, at the addresses Tutor's development mode uses.

*****************
Slots and Widgets
*****************

Learning offers slots that sites use to change its pages, and ships widgets
that sites can add to its slots or render elsewhere. See:

- `src/slots/README.md`_ for the slots, with a README and examples for each.
- `src/widgets/README.md`_ for the widgets.

.. _src/slots/README.md: ./src/slots/README.md
.. _src/widgets/README.md: ./src/widgets/README.md

**********
Developing
**********

Project Structure
=================

The layout follows the standard `frontend-base app layout`_:

- ``src/app.ts``: the app definition imported by ``site.config.*.tsx``.
- ``src/constants.ts``: the app's ``appId`` and route roles.
- ``src/index.ts``: the package's public exports.
- ``src/routes.tsx``: the app's routes.
- ``src/Main.tsx``: the root component for the app's routes.
- ``src/slots.tsx``: the slot operations this app registers: its widgets in the
  shell's header and course bar, and its tabs in its own tab slots.
- ``src/slots/``: the slots this app offers.
- ``src/widgets/``: the widgets this app ships.
- ``src/style.scss``: the app's styles.

.. _frontend-base app layout: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md#src-file-structure

Build Process Notes
===================

``npm run build`` compiles the library into ``dist/`` with ``tsc`` and
``tsc-alias``, and copies the SCSS and asset files across. This is what gets
published and what sites consume.

``npm run build:ci`` runs ``openedx build`` against ``site.config.ci.tsx``, so
webpack goes through the whole app. It catches problems, such as broken
lazy-loaded imports or stylesheets, that ``tsc`` and Jest do not.

Internationalization
====================

See the `frontend-base i18n how-to`_.

.. _frontend-base i18n how-to: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst

************
Getting Help
************

If you're having trouble, we have `discussion forums`_
where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_. Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-learning/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/community/connect
.. _discussion forums: https://discuss.openedx.org

************
Contributing
************

Contributions are very welcome. Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features. However, please make sure
to discuss your new feature idea with the maintainers before
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

AI Contribution Policy
======================

Note that contributions are expected to follow the Open edX `AI Contribution Policy`_.

.. _AI Contribution Policy: https://github.com/openedx/.github/blob/master/AI_POLICY.md

****************************
The Open edX Code of Conduct
****************************

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

*******
License
*******

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

*************************
Reporting Security Issues
*************************

Please do not report security issues in public. Please email security@openedx.org.

.. |license-badge| image:: https://img.shields.io/badge/license-AGPL-informational
   :target: https://github.com/openedx/frontend-app-learning/blob/master/LICENSE
   :alt: License

.. |ci-badge| image:: https://github.com/openedx/frontend-app-learning/actions/workflows/ci.yml/badge.svg
   :target: https://github.com/openedx/frontend-app-learning/actions/workflows/ci.yml
   :alt: Continuous Integration

.. |codecov| image:: https://codecov.io/github/openedx/frontend-app-learning/coverage.svg?branch=master
   :target: https://codecov.io/github/openedx/frontend-app-learning?branch=master
   :alt: Codecov

.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
   :alt: semantic-release
