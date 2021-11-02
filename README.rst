|codecov| |license|

frontend-app-learning
=========================

Introduction
------------

This is the Learning MFE (micro-frontend application), which renders all
learner-facing course pages (like the course outline, the progress page,
actual course content, etc).

Please tag **@edx/engage-squad** on any PRs or issues.  Thanks.

.. |codecov| image:: https://codecov.io/gh/edx/frontend-app-learning/branch/master/graph/badge.svg?token=3z7XvuzTq3
   :target: https://codecov.io/gh/edx/frontend-app-learning
.. |license| image:: https://img.shields.io/badge/license-AGPL-informational
   :target: https://github.com/edx/frontend-app-account/blob/master/LICENSE

Development
-----------

Start Devstack
^^^^^^^^^^^^^^

To use this application, `devstack <https://github.com/edx/devstack>`__ must be running and you must be logged into it.

- Run ``make dev.up.lms``
- Visit http://localhost:2000/course/course-v1:edX+DemoX+Demo_Course to view the demo course.  You can replace ``course-v1:edX+DemoX+Demo_Course`` with a different course key.

Local module development
^^^^^^^^^^^^^^^^^^^^^^^^

To develop locally on modules that are installed into this app, you'll need to create a ``module.config.js``
file (which is git-ignored) that defines where to find your local modules, for instance::

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
        { moduleName: '@edx/paragon/scss', dir: '../paragon', dist: 'scss' },
        { moduleName: '@edx/paragon', dir: '../paragon', dist: 'dist' },
        { moduleName: '@edx/frontend-enterprise', dir: '../frontend-enterprise', dist: 'src' },
        { moduleName: '@edx/frontend-platform', dir: '../frontend-platform', dist: 'dist' },
     ],
   };

See https://github.com/edx/frontend-build#local-module-configuration-for-webpack for more details.

Deployment
----------

The Learning MFE is similar to all the other Open edX MFEs. Read the Open
edX Developer Guide's section on
`MFE applications <https://edx.readthedocs.io/projects/edx-developer-docs/en/latest/developers_guide/micro_frontends_in_open_edx.html>`_.

Environment Variables
^^^^^^^^^^^^^^^^^^^^^

This MFE is configured via environment variables supplied at build time.
All micro-frontends have a shared set of required environment variables,
as documented in the Open edX Developer Guide under
`Required Environment Variables <https://edx.readthedocs.io/projects/edx-developer-docs/en/latest/developers_guide/micro_frontends_in_open_edx.html#required-environment-variables>`_.

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
  one in the example below, if you don't want to have your own branded version.

  Example: https://support.edx.org/hc/en-us/articles/360000038428-Entering-math-expressions-in-assignments-or-the-calculator

SUPPORT_URL_ID_VERIFICATION
  A link that explains how to verify your ID. Shown in contexts where you need
  to verify yourself to earn a certificate. The example link below is probably too
  edx.org-specific to use for your own site.

  Example: https://support.edx.org/hc/en-us/articles/206503858-How-do-I-verify-my-identity

SUPPORT_URL_VERIFIED_CERTIFICATE
  A link that explains what a verified certificate is.  You can use the
  one in the example below, if you don't want to have your own branded version.
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

  Example: https://twitter.com/edXOnline

