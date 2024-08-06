const express = require('express');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
// include multer
const multer = require('multer')
// Specify the port for the server to listen on
const port = 3000;

// Set up view engine to ejs
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
// enable form processing
app.use(express.urlencoded({
    extended: false
}));
// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ 
    extended: true 
}));
// set up multer for file uploads 
const storage = multer.diskStorage ({
    destination: (req,file, cb) => {
        cb(null, 'public/images'); // directory to save uploaded files
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer ({storage: storage});


// connect to database
const connection = mysql.createConnection({
    host: 'mysql-smmartist.alwaysdata.net',
    user: 'smmartist',
    password: 'Myp20182018$',
    database: 'smmartist_app'
})
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


// use res.render to load up an ejs view file
// signin page
app.get('/signinpage', function(req, res) {
    res.render('signinpage')
});


// create new account page
// signup page
app.get('/signuppage', (req, res) => {
    res.render('signuppage')
});

app.post('/signuppage', (req, res) => {
    // Extract data from requested body
    const { account_type, username, email, password, gender, age, height, weight } = req.body;
    const sql = 'INSERT INTO accounts (account_type, username, email, password, gender, age, height, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    // Insert the new account into the database
    connection.query( sql , [account_type, username, email, password, gender, age, height, weight], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database opperation
            console.error("Error adding the new account:", error);
            res.status(500).send('Error adding account');
        } else {
            // send a success response
            res.send('Account successfully registered !');
        }
    });
});

// delete account page
app.get('/delete_account', function(req, res) {
    res.render('delete_account')
});
// function to delete account from database
app.post('/delete_account', (req, res) => {
    const username = req.body.username;
    const sql = 'DELETE FROM accounts WHERE username= ?';
    connection.query( sql , [username], (error, results) => {
        if (error) {
            // Handle any error that occur during the database operation
            console.error("Error deleting account:", error);
            res.status(500).send('Error deleting account');
        } else {
            // send a success response
            res.send('Account successfully deleted !');
        }
    });
});

// guest page
app.get('/guest', function(req, res) {
    res.render('guest')
});

// direct_message
app.get('/direct_message', function(req, res) {
    res.render('direct_message')
});

// f2f_sparring
//display all bookings(right now just tanah)
app.get('/f2f_sparring', (req, res) => {
    const sql = 'SELECT * FROM book_tanah';
    // Fetch data from MySQL
    connection.query( sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving bookings');
        }
        // Render HTML page with data
        res.render('f2f_sparring', { book_tanah: results });
    });
});


// getbook_tanah
app.get('/book_tanah', function(req, res) {
    res.render('book_tanah')
});
// bookaslot_tanah
app.post('/book_tanah', (req, res) => {
    // Extract booking from the request body
    const { day, time } = req.body;
    const sql = 'INSERT INTO book_tanah (day, time) VALUES (?, ?)';
    // Insert new booking into database
    connection.query( sql , [day, time], (error, results) => {
        if (error) {
            // Handle any errors during the database operation
            console.error("Error adding booking:", error);
            res.status(500).send('Error adding booking');
        } else {
            // send success response
            res.send('Venue booked!');
        }
    });
});

// get one booking
app.get('/booking/:id', (req, res) => {
    // Extract the booking ID from the request parameters
    const tanah_id = req.params.id;
    const sql = "SELECT * FROM book_tanah WHERE tanah_id = ?";
    // Fetch data from MySQL based on the id
    connection.query( sql , [tanah_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving booking by ID');
        }
        // Check if any booking with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the booking data
            res.render('booking', { booking: results[0] });
        } else {
            // If no booking with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Product not found');
        }
    });
});

// update one booking
app.get('/editbooking/:id', (req, res) => {
    const tanah_id = req.params.id;
    const sql = 'SELECT * FROM book_tanah WHERE tanah_id = ?';
    // Fetch data from MySQL based on the booking id
    connection.query( sql , [tanah_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving booking by ID');
        }
        // Check if any booking with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the booking data
            res.render('edit_booking', { booking: results[0] });
        } else {
            // If no product with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Booking not found');
        }
    });
});

app.post('/editbooking/:id', (req, res) => {
    const tanah_id = req.params.id;
    // Extract booking data from request body
    const { day, time } = req.body;
    const sql = 'UPDATE book_tanah SET day = ? , time = ? WHERE tanah_id = ?';

    // Insert the updated booking into the database
    connection.query( sql , [day, time, tanah_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating booking:", error);
            res.status(500).send('Error updating booking');
        } else {
            // Send a success response
            res.send("Booking updated successfully!");
        }
    });
});

// delete a booking
app.get('/deletebooking/:id', (req, res) => {
    const tanah_id = req.params.id;
    const sql = 'DELETE FROM book_tanah WHERE tanah_id = ?';
    connection.query( sql , [tanah_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting booking:", error)
            res.status(500).send('Error deleting booking');
        } else {
            // Send a success response
            res.redirect('/f2f_sparring');
        }
    });
});

// getbook_ecp
app.get('/book_ecp', function(req, res) {
    res.render('book_ecp')
});
// bookaslot_ecp
app.post('/book_ecp', (req, res) => {
    // Extract booking from the request body
    const { day, time } = req.body;
    const sql = 'INSERT INTO book_ecp (day, time) VALUES (?, ?)';
    // Insert new booking into database
    connection.query( sql , [day, time], (error, results) => {
        if (error) {
            // Handle any errors during the database operation
            console.error("Error adding booking:", error);
            res.status(500).send('Error adding booking');
        } else {
            // send success response
            res.send('Venue booked!');
        }
    });
});

// getbook_punggol
app.get('/book_punggol', function(req, res) {
    res.render('book_punggol')
});
// bookaslot_punggol
app.post('/book_punggol', (req, res) => {
    // Extract booking from the request body
    const { day, time } = req.body;
    const sql = 'INSERT INTO book_punggol (day, time) VALUES (?, ?)';
    // Insert new booking into database
    connection.query( sql , [day, time], (error, results) => {
        if (error) {
            // Handle any errors during the database operation
            console.error("Error adding booking:", error);
            res.status(500).send('Error adding booking');
        } else {
            // send success response
            res.send('Venue booked!');
        }
    });
});


// fetching venues from database
/*app.get('/admin_f2f_sparring', (req, res) => {
    const sql = 'SELECT * FROM venues';
    // Fetch data from MySQL
    connection.query( sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving venues');
        }
        // render HTML page with data
        res.render('admin_f2f_sparring', { venues: results });
    });
});*/


// admin users
// f2f_sparring
// add venue
app.get('/admin_f2f_sparing', function(req, res) {
    res.render('admin_f2f_sparing')
})


// start the server and listen on the specified port
app.listen(port, () => {
    // log a message when the server is successfully started
    console.log(`Server is running at http://localhost:${port}`);
});