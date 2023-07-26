const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const ejs = require("ejs");
const app = require('express')();


// const http = require('http').Server(app);
// const io = require('socket.io')(http);
const port=8000;


app.set("view engine", "ejs");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID:  "377883117249-0h477cigf1c5n546tk3l05h49kboj2pa.apps.googleusercontent.com",
      clientSecret:  "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",
      callbackURL: "http://localhost:8000/login",
    },
    function (accessToken, refreshToken, profile, cb) {
      // Use the profile information to authenticate the user
      // ...
      cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

//used for websocket 
app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "..", "login.ejs"));
});

app.get("/dashboard", (req, res) => {
  // check if user is logged in
  if (req.isAuthenticated()) {
    res.render(path.join(__dirname, "..", "dashboard.ejs"), { user: req.user });
  } else {
    res.redirect("/login");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);



app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
