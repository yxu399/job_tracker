/*
    SETUP
*/

// Express
const express = require('express');
const app = express();
const path = require('path'); 

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

PORT = 9191;

// Load route modules
// const companiesRoutes = require('./routes/companiesRoutes');
const jobPostingsRoutes = require('./routes/jobPostingsRoutes');
// const postingsSkillsRoutes = require('./routes/postingsSkillsRoutes');
// const rolesRoutes = require('./routes/rolesRoutes');
// const skillPlansRoutes = require('./routes/skillPlansRoutes');
// const skillsRoutes = require('./routes/skillsRoutes');

// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', exphbs.engine({extname: '.hbs'}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.


/*
    ROUTES
*/
// Set up routes
function setupRoutes() {
    // app.use('/companies', companiesRoutes);
    app.use('/jobPostings', jobPostingsRoutes);
    // app.use('/postingsSkills', postingsSkillsRoutes);
    // app.use('/roles', rolesRoutes);
    // app.use('/skillPlans', skillPlansRoutes);
    // app.use('/skills', skillsRoutes);

    // Home route
    app.get('/', (req, res) => {
        res.render('index');
    });

    // 404 Error handler - this should be the last route
    app.use((req, res, next) => {
        res.status(404).render('404');
    });
}

// Call the function to set up the routes
setupRoutes();
/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});