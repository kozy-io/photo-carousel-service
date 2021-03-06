require('newrelic');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./server/postgres/index.js');
const app = express();
const port = 3002;

app.use(morgan('tiny'));
app.use(bodyParser());

// app.get('*.js', (req, res, next) => {
//   req.url = req.url + '.gz';
//   res.set('Content-Encoding', 'gzip');
//   next();
// });
app.use('/',express.static(path.resolve(__dirname, './public/dist')));
app.use('/:listingId', express.static(path.resolve(__dirname, './public/dist')));

// Get a specific listingId
app.get('/api/listings/:listingId', (req, res) => {
  const { listingId } = req.params;
  const QUERY = 'SELECT * FROM listings WHERE _id = $1';
  db.query(QUERY, [listingId], (error, results) => {
    if (error) {
      throw error
    }
    res.send(results.rows)
  })
});

// Add new listing
app.post('/api/listings', (req, res) => {
  const { title,location,rating,total_ratings,user_id } = req.body;
  const QUERY = 'INSERT INTO listings(title,location,rating,total_ratings,user_id) VALUES ($1,$2,$3,$4,$5)';
  db.query(
    QUERY, 
    [title, location, rating, total_ratings, user_id],
    (error, results) => {
      if (error) {
        throw error
      }
      res.send(results.rows)
    }
  )
});

// Edit listing
app.put('/api/listings/:listingId', (req, res) => {
  const { listingId } = req.params;
  const { title,location } = req.body;
  const QUERY = 'UPDATE listings SET title = $1, location = $2 WHERE _id = $3';
  db.query(
    QUERY, 
    [title, location, listingId],
    (error, results) => {
      if (error) {
        throw error
      }
      res.send(results.rows)
    }
  )
});

// Delete listing
app.delete('/api/listings/:listingId', (req, res) => {
  // TODO
});

// Get photos by listingId
app.get('/api/photos/:listingId', (req, res) => {
  const { listingId } = req.params;
  const QUERY = 'SELECT * FROM photos WHERE listing_id = $1';
  db.query(QUERY, [listingId], (error, results) => {
    if (error) {
      throw error
    }
    res.send(results.rows)
  })
});

// Add new photo
app.post('/api/photos/:listingId', (req, res) => {
  const { listingId } = req.params;
  const { photo_url,caption } = req.body;
  const QUERY = 'INSERT INTO photos(listing_id,photo_url,priority,caption) VALUES ($1,$2,0,$3)';
  db.query(
    QUERY, 
    [listingId,photo_url,caption],
    (error, results) => {
      if (error) {
        throw error
      }
      res.send(results.rows)
    }
  )
});

// TODO: create endpoints that are missing

app.listen(port, () => console.log(`Listening on port ${port}!`));