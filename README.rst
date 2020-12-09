|Coveralls| |npm_version| |npm_downloads| |license|

frontend-app-learning
=========================

Please tag **@edx/teaching-and-learning** on any PRs or issues.  Thanks.

Introduction
------------

React app for edX learning.

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
