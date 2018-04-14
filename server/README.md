
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

### Assumptions for demo
<ol>
<li>Time windows are infinite (i.e. ports do not close, trucks can arrive at dropoff/pickup locations at any time).</li>
<li>Capacity of trucks is unit size (i.e. each truck after visiting a pickup location is full - this can be easily changed by using a different parameter in the model per truck)</li>
</ol>

### Dev Notes:
Routable uses a postgres database for retaining and querying schedule information. To set up the DB config, add the following to your environment:
<pre>
user = process.env.ROUTABLE_DB_USER // db user name
pass = process.env.ROUTABLE_DB_PASS // db user password
host = process.env.ROUTABLE_HOST // db host
db = process.env.ROUTABLE_DB // db name
</pre>

Prepare the DB by running `init.sql` from the `/models` folder.

Running the server:
<pre>
yarn && node server.js
</pre>

Running unit tests:
<pre>
npm install -g mocha
mocha *test.js
</pre>

