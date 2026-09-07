const express = require("express");

const app = express();
const path = require("path");
const fs = require("fs");

app.set('view engine', 'ejs'); // to use ejs files in views folder

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); /// public static files -- images, css, js 

// Read all tasks
app.get('/', function (req, res) {
    fs.readdir(`./files`, function(err, files){
        res.render("index", {files:files});//render use to view file from views folder that why we set view engine to ejs not send file
    });
});

// Read single task details
app.get('/file/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`,"utf-8", function(err, filedata){
        res.render('show', {filename: req.params.filename, filedata: filedata});//passing file name and data to show.ejs file
    })
});

// Show edit form
app.get('/edit/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render('edit', { filename: req.params.filename, filedata: filedata });
    });
});

// Handle edit submission via /edit
app.post('/edit', function (req, res) {
    const previous = req.body.previous;
    let newTitle = req.body.newTitle || req.body.title || previous;

    // Add .txt extension if not provided
    if (!newTitle.endsWith('.txt')) {
        newTitle = newTitle.trim().split(' ').join('_') + '.txt';
    }

    const oldPath = `./files/${previous}`;
    const newPath = `./files/${newTitle}`;

    // if filename changed, rename the file and update its details
    if (previous && previous !== newTitle) {
        fs.rename(oldPath, newPath, function (err) {
            fs.writeFile(newPath, req.body.details || '', function (err) {
                res.redirect('/');
            });
        });
    } else {
        // if filename is same, only update the file content
        const targetPath = previous ? oldPath : newPath;
        fs.writeFile(targetPath, req.body.details || '', function (err) {
            res.redirect('/');
        });
    }
});

// Also support /edit/:filename if submitted with filename in path
app.post('/edit/:filename', function (req, res) {
    const previous = req.params.filename;
    let newTitle = req.body.newTitle || req.body.title || previous;

    if (!newTitle.endsWith('.txt')) {
        newTitle = newTitle.trim().split(' ').join('_') + '.txt';
    }

    const oldPath = `./files/${previous}`;
    const newPath = `./files/${newTitle}`;

    if (previous !== newTitle) {
        fs.rename(oldPath, newPath, function (err) {
            fs.writeFile(newPath, req.body.details || '', function (err) {
                res.redirect('/');
            });
        });
    } else {
        fs.writeFile(oldPath, req.body.details || '', function (err) {
            res.redirect('/');
        });
    }
});

// Show delete confirmation page
app.get('/delete/:filename', function (req, res) {
    res.render('delete', { filename: req.params.filename });
});

// Handle delete execution
app.post('/delete/:filename', function (req, res) {
    fs.unlink(`./files/${req.params.filename}`, function (err) {
        res.redirect('/');
    });
});

// Create task
app.post('/create', function (req, res) {
    console.log(req.body);
    fs.writeFile(`./files/${req.body.title.split(' ').join('_')}.txt` ,req.body.details, function(err){
        res.redirect('/');
    });
});

// Dynamic routes
app.get('/profile/:username', function (req, res) {
    res.send("welcome, " + req.params.username);
});

app.get('/profile/:username/:age', function (req, res) {
    res.send("welcome, " + req.params.username + " your age is " + req.params.age);
});

app.listen(3000, function () {
    console.log("server chal raha h");
})