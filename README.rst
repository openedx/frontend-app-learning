|Coveralls| |npm_version| |npm_downloads| |license|

The Open edX Learning Micro-Frontend
====================================

.. |build| image:: https://img.shields.d io/github/workflow/status/edx/frontend-app-learning/ci?event=push
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-app-learning.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-app-learning
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning

Introduction
------------

This is a Web application frontend for learning on the `Open edX platform`_. It is largely powered by JSON APIs and views provided by the `edx-platform LMS`_ (learning management system). It is built using React and Redux, as well as Open edX's `frontend-platform`_ and `frontend-build`_ libraries.

.. _Open edX platform: https://open.edx.org
.. _edx-platform LMS: https://github.com/edx/edx-platform
.. _frontend-platform: https://github.com/edx/frontend-platform/
.. _frontend-build: https://github.com/edx/frontend-build/


Features
--------

The three major features offered by frontend-app-learning are the Course Home, Courseware and the Instructor Toolbar. All features are displayed in the context of a "course" (also known as a "course run").


Course Home
^^^^^^^^^^^

The Course Home includes several pages to help students understand the structure of a course, navigate a course, and keep track of their progress and upcoming deadlines.

*insert pictures*


Courseware
^^^^^^^^^^

Courseware is where students progress through the content of a course, which is organized into **Sequences** of content **Units**. Each **Unit** is a page that may include readings, videos, problems, discussions, free-response prompts, or other learning objects.

While Courseware navigation is rendered by frontend-app-learning, the inner content of each **Unit** is currently implemented as an IFrame to edx-platform's chromeless XBlock view.

*insert pictures*

Instructor Toolbar
^^^^^^^^^^^^^^^^^^

*insert description*

*insert pictures*

Contributing
-------------

Please see the `Open edX Platform contribution guidelines <https://github.com/edx/edx-platform/blob/master/CONTRIBUTING.rst>`_.


Development
-----------

With Devstack
^^^^^^^^^^^^^

The recommended way to test and run frontend-app-learning is via the `Open edX Devstack <https://github.com/edx/devstack>`_. After downloading and provisioning devstack, frontend-app-learning can be started (alongside LMS) with ``make dev.up.lms``.

The app will be run inside a container named ``edx.devstack.frontend-app-learning``. You can attach to the container and watch its build progress using ``make dev.attach.frontend-app-learning``. You can shell into the container (for linting and testing) with ``make dev.shell.frontend-app-learning``.

Once the dev server is up, visit http://localhost:2000/course/course-v1:edX+DemoX+Demo_Course to view the demo course.  You can replace ``course-v1:edX+DemoX+Demo_Course`` with a different course key.

Without Devstack
^^^^^^^^^^^^^^^^

This app can also be tested and run directly on one's host computer without the help of Devstack. In order to interact with the application, though, you will need to run an LMS, and make sure ``LMS_BASE_URL`` (in ``.env.development``) is pointing at it.

To start a standalone frontend-app-learning on your computer, run the following from within the root of this repository::

   npm install
   npm start


Testing and Linting
^^^^^^^^^^^^^^^^^^^

Whether you are running the app within devstack or standalone, tests can be run with::

  npm test                    # Run all tests.
  npm test -- src/courseware  # Run tests in a particular directory.

And quality checks can be run with::

  npm run lint
