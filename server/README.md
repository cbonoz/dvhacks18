
Routable - Routing and API Server
---

### High level endpoint descriptions:

POST:
* /api/schedule/add
Add a new list of schedule data to the routable index.

Format:
<pre>
TODO: {}
</pre>

GET:
* /api/schedule/:day/:driver
Get the optimal schedule for the given driver for the given day based on the currently uploaded schedule data in the Routable index.

Format:
<pre>
TODO: {}
</pre>

### Dev Notes:
Running the server:
<pre>
yarn && node server.js
</pre>

Running unit tests:
<pre>
npm install -g mocha
mocha *test.js
</pre>

