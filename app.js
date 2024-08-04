// Express
const express = require('express');
const app = express();
const path = require('path'); 

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

PORT = 9191;

// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');

// Load route modules
const jobPostingsRoutes = require('./routes/jobPostingsRoutes');

// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//     next();
// });

/*
    ROUTES
*/
function setupRoutes() {
    // Home route
    app.get('/', (req, res) => {
        res.render('index');
    });

    // Routes to different tables
    app.use('/jobPostings', jobPostingsRoutes);


    // 404 Error handler 
    app.use((req, res, next) => {
        res.status(404).json({ error: "Route not found" });
    });

    // General error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong", details: err.message });
    });
}

// Set up routes
setupRoutes();

/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});