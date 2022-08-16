require("dotenv").config()
const Express = require("express");
var app = Express();
const BodyParser = require("body-parser");
const cors = require("cors");

/**
 * Helmet to set http headers for routes thus prevent injection
 */
const helmet = require("helmet");
app.use(helmet());

/**
 * Request rate limiting
 */
const expressRateLimit = require("express-rate-limit");
const limiter = expressRateLimit({
  windowMs: 10 * 60 * 1000, // 2 mins
  max: 500, // No of Requests
});
app.use(limiter);

/**
 * Prevent access of any hidden info if api is exposed
 */
const hpp = require("hpp");
app.use(hpp());

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(cors());
// Enabling Cross Origin Resource  Sharing
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

/**
 * api starts here; the rest is just but the normal express app config
 * 
 * The api is intended to serve all daily readings, saint of the day, daily reflection, catholic calendar in both swahili, english and *kikuyu
 * 
 * Minor: 
 *    Serve the whole catholic bible as a whole
 *    Serve popular saints data - done 
 *    Serve populr prayers - done
 *    Serve the rosary and all its mystries:
 *        7 sorrow rosary
 *        Divine mercy rosary
 *        The rosary of our lady
 *    Vocations, catholic catechesis 
 *    
 *      
 *      
 */

const fetchDataFromGoogleCSE = require("./controllers/fetchDataFromGoogleCSE");
const DailyReadings = require('./controllers/getDailyReadings');
const fetchNewsFromCNA = require('./controllers/fetchNewsFromCNA');

app.post("/fetchDataFromGoogleCSE", fetchDataFromGoogleCSE);
app.post("/fetchDailyReadings", (req, res) => new DailyReadings(req, res));
app.post('/fetchNewsFromCNA', fetchNewsFromCNA);

/**
 * DnA api ends here
 */

module.exports = app;