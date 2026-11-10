# Widgets

Built-in widgets this app provides. Each subdirectory is a small app-like
bundle of slot operations (plus any components they render) that inserts
widgets into slots offered by the shell or by other apps.

Widget apps are wired up by spreading their `slots` into `src/slots.tsx`,
which is what the main app declares to the shell.

See the [frontend-base slots
documentation](https://github.com/openedx/frontend-base/blob/main/docs/decisions/0009-slot-naming-and-lifecycle.rst)
for slot naming and lifecycle conventions.
