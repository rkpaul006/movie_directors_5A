const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;
let db1 = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return { movieName: dbObject.movie_name };
};

const convertDbObjToResponseObj = (dbObject2) => {
  return {
    movieId: dbObject2.movie_id,
    directorId: dbObject2.director_id,
    movieName: dbObject2.movie_name,
    leadActor: dbObject2.lead_actor,
  };
};

const convertDbObjToResponseObj1 = (dbObject2) => {
  return {
    directorId: dbObject2.director_id,
    directorName: dbObject2.director_name,
  };
};
const convertDbObjToResponseObj2 = (dbObj2) => {
  return {
    movieName: dbObj2.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesList = `SELECT * FROM movie;`;
  const moviesList = await db.all(getMoviesList);
  response.send(
    moviesList.map((each) => convertDbObjectToResponseObject(each))
  );
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetail = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieDetail);
  response.send(convertDbObjToResponseObj(movieDetails));
});

app.get("/directors/", async (request, response) => {
  const getMoviesList = `SELECT * FROM director;`;
  const moviesList = await db.all(getMoviesList);
  response.send(moviesList.map((each) => convertDbObjToResponseObj1(each)));
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetail = `
    DELETE
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieDetail);
  response.send("Movie Removed");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetails = `
    UPDATE movie SET
    director_id = "${directorId}",
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE
     movie_id = ${movieId};`;

  const updateMovie = await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const insertMovieDetails = `
    INSERT INTO
     movie (director_id, movie_name, lead_actor)
    VALUES
    (
     "${directorId}",
     "${movieName}",
     "${leadActor}"
     );`;
  const movieAddition = await db.run(insertMovieDetails);
  response.send("Movie Successfully Added");
});

app.get("/directors/:directorId/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesList = `SELECT * FROM movie WHERE director_id = ${directorId};`;
  const moviesList = await db.get(getMoviesList);
  response.send(moviesList.map((each) => convertDbObjToResponseObj2(each)));
});

module.exports = app;
