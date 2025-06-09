frontend-app-learning
#####################

|codecov| |license|

Purpose
*******

This is the Learning MFE (micro-frontend application), which renders all
learner-facing course pages (like the course outline, the progress page,
actual course content, etc).

.. |codecov| image:: https://codecov.io/gh/edx/frontend-app-learning/branch/master/graph/badge.svg?token=3z7XvuzTq3
   :target: https://codecov.io/gh/edx/frontend-app-learning
.. |license| image:: https://img.shields.io/badge/license-AGPL-informational
   :target: https://github.com/openedx/frontend-app-account/blob/master/LICENSE

Getting Started
***************

Prerequisites
=============

`Tutor`_ is currently recommended as a development environment for the Learning
MFE. Most likely, it already has this MFE configured; however, you'll need to
make some changes in order to run it in development mode. You can refer
to the `relevant tutor-mfe documentation`_ for details, or follow the quick
guide below.

.. _Tutor: https://github.com/overhangio/tutor

.. _relevant tutor-mfe documentation: https://github.com/overhangio/tutor-mfe#mfe-development


Cloning and Setup
=================

1. Clone your new repo:

.. code-block:: bash

    git clone https://github.com/openedx/frontend-app-learning.git

2. Use the version of Node specified in ``.nvmrc``.

  Using other major versions of node *may* work, but this is unsupported.  For
  convenience, this repository includes an ``.nvmrc`` file to help in setting the
  correct node version via `nvm <https://github.com/nvm-sh/nvm>`_.

3. Stop the Tutor devstack, if it's running: ``tutor dev stop``

4. Next, we need to tell Tutor that we're going to be running this repo in
   development mode, and it should be excluded from the ``mfe`` container that
   otherwise runs every MFE. Run this:

.. code-block:: bash

    tutor mounts add /path/to/frontend-app-learning

5. Start Tutor in development mode. This command will start the LMS and Studio,
   and other required MFEs like ``authn`` and ``account``, but will not start
   the learning MFE, which we're going to run on the host instead of in a
   container managed by Tutor. Run:

.. code-block:: bash

    tutor dev start lms cms mfe

Startup
=======

1. Install npm dependencies:

.. code-block:: bash

  cd frontend-app-learning && npm ci

2. Start the dev server:

.. code-block:: bash

  npm run dev

Then you can access the app at http://local.openedx.io:2010/learning/

Troubleshooting
---------------

If you see an "Invalid Host header" error, then you're probably using a different domain name for your devstack such as
``local.edly.io`` or ``local.overhang.io`` (not the new recommended default, ``local.openedx.io``). In that case, run
these commands to update your devstack's domain names:

.. code-block:: bash

  tutor dev stop
  tutor config save --set LMS_HOST=local.openedx.io --set CMS_HOST=studio.local.openedx.io
  tutor dev launch -I --skip-build
  tutor dev stop learning  # We will run this MFE on the host

Local module development
=========================

To develop locally on modules that are installed into this app, you'll need to create a ``module.config.js``
file (which is git-ignored) that defines where to find your local modules, for instance:

.. code-block:: js

   module.exports = {
     /*
     Modules you want to use from local source code.  Adding a module here means that when this app
     runs its build, it'll resolve the source from peer directories of this app.

     moduleName: the name you use to import code from the module.
     dir: The relative path to the module's source code.
     dist: The sub-directory of the source code where it puts its build artifact.  Often "dist", though you
       may want to use "src" if the module installs React as a peer/dev dependency.
     */
     localModules: [
        { moduleName: '@openedx/paragon/scss', dir: '../paragon', dist: 'scss' },
        { moduleName: '@openedx/paragon', dir: '../paragon', dist: 'dist' },
        { moduleName: '@openedx/frontend-enterprise', dir: '../frontend-enterprise', dist: 'src' },
        { moduleName: '@openedx/frontend-platform', dir: '../frontend-platform', dist: 'dist' },
     ],
   };

See https://github.com/openedx/frontend-build#local-module-configuration-for-webpack for more details.

Deployment
==========

The Learning MFE is similar to all the other Open edX MFEs. Read the Open
edX Developer Guide's section on
`MFE applications <https://openedx.github.io/frontend-platform/>`_.

Plugins
=======
This MFE can be customized using `Frontend Plugin Framework <https://github.com/openedx/frontend-plugin-framework>`_.

The parts of this MFE that can be customized in that manner are documented `here </src/plugin-slots>`_.

Environment Variables
=====================

This MFE is configured via environment variables supplied at build time.
All micro-frontends have a shared set of required environment variables,
as documented in the Open edX Developer Guide under
`Required Environment Variables <https://openedx.github.io/frontend-platform/>`_.

The learning micro-frontend also supports the following additional variables:

CREDIT_HELP_LINK_URL
  A link to resources to help explain what course credit is and how to earn it.

ENABLE_JUMPNAV
  Enables the new Jump Navigation feature in the course breadcrumbs, defaulted to  the string 'true'.
  Disable to have simple hyperlinks for breadcrumbs. Setting it to any other value but 'true' ('false','I love flags', 'etc' would disable the Jumpnav).
  This feature flag is slated to be removed as jumpnav becomes default. Follow the progress of this ticket here:
  https://openedx.atlassian.net/browse/TNL-8678

SOCIAL_UTM_MILESTONE_CAMPAIGN
  This value is passed as the ``utm_campaign`` parameter for social-share
  links when celebrating learning milestones in the course. Optional.

  Example: ``milestone``

SUPPORT_URL_CALCULATOR_MATH
  A link that explains how to use the in-course calculator. You can use the
  one in the example below if you don't want to have your own branded version.

  Example: https://support.edx.org/hc/en-us/articles/360000038428-Entering-math-expressions-in-assignments-or-the-calculator

SUPPORT_URL_ID_VERIFICATION
  A link that explains how to verify your ID. Shown in contexts where you need
  to verify yourself to earn a certificate. The example link below is probably too
  edx.org-specific to use for your own site.

  Example: https://support.edx.org/hc/en-us/articles/206503858-How-do-I-verify-my-identity

SUPPORT_URL_VERIFIED_CERTIFICATE
  A link that explains what a verified certificate is.  You can use the
  one in the example below if you don't want to have your own branded version.
  Optional.

  Example: https://support.edx.org/hc/en-us/articles/206502008-What-is-a-verified-certificate

TWITTER_HASHTAG
  This value is used in the Twitter social-share link when celebrating learning
  milestones in the course. Will prefill the suggested post with this hashtag.
  Optional.

  Example: ``brandedhashtag``

TWITTER_URL
  A link to your Twitter account. The Twitter social-share link won't appear
  unless this is set. Optional.

  Example: https://twitter.com/openedx

Getting Help
============

If you're having trouble, we have `discussion forums`_
where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
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

Contributing
============

Contributions are very welcome. Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to discuss your new feature idea with the maintainers before
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

The Open edX Code of Conduct
============================

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Reporting Security Issues
=========================

Please do not report security issues in public. Please email security@openedx.org.
