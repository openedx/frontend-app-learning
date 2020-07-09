|Build Status| |Coveralls| |npm_version| |npm_downloads| |license|

frontend-app-learning
=========================

Please tag **@edx/teaching-and-learning** on any PRs or issues.  Thanks.

Introduction
------------

React app for edX learning.

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-app-learning.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-app-learning
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-app-learning.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-app-learning
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-learning.svg
   :target: @edx/frontend-app-learning

Development
-----------

Start Devstack
^^^^^^^^^^^^^^

To use this application `devstack <https://github.com/edx/devstack>`__ must be running and you must be logged into it.

-  Start devstack
-  Log in (http://localhost:18000/login)

Start the development server
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In this project, install requirements and start the development server by running:

.. code:: bash

   npm install
   npm start # The server will run on port 1995

Once the dev server is up, visit http://localhost:2000/course/course-v1:edX+DemoX+Demo_Course to view the demo course.  You can replace ``course-v1:edX+DemoX+Demo_Course`` with a different course key.
