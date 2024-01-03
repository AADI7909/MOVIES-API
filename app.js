const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initilializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initilializeDBAndServer()

const ConvertDbObjToResponseObj = eachkey => {
  return {
    movieId: eachkey.movie_id,
    directorId: eachkey.director_id,
    movieName: eachkey.movie_name,
    leadActor: eachkey.lead_actor,
  }
}

// API 1
app.get('/movies/', async (request, response) => {
  const GetAllMovieNames = `
      SELECT movie_name FROM movie ORDER BY movie_id;
  `
  const MoviesArray = await db.all(GetAllMovieNames)
  response.send(
    MoviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

// API 2
app.post('/movies/', async (request, response) => {
  const MovieDetails = request.body
  const {directorId, movieName, leadActor} = MovieDetails
  const AddMovieDetails = `
      INSERT INTO
      movie (director_id,movie_name,lead_actor)
      VALUES ("${directorId}","${movieName}","${leadActor}");
  `
  await db.run(AddMovieDetails)
  response.send('Movie Successfully Added')
})

// API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const GetMovieQuery = `
      SELECT * FROM movie 
      WHERE movie_id = ${movieId};
  `
  dbMovieObj = await db.get(GetMovieQuery)
  response.send(ConvertDbObjToResponseObj(dbMovieObj))
})

//API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const MovieUpdateDetails = request.body
  const {directorId, movieName, leadActor} = MovieUpdateDetails
  const UpdateMovieDetails = `
      UPDATE movie
      SET director_id = "${directorId}",
          movie_name = "${movieName}",
          lead_actor = "${leadActor}";
  `
  await db.run(UpdateMovieDetails)
  response.send('Movie Details Updated')
})

// API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const DeleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};
  `
  await db.run(DeleteMovieQuery)
  response.send('Movie Removed')
})

const ConvertDbDirectorToResponseObj = each => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  }
}

// API 6
app.get('/directors/', async (request, response) => {
  const GetAllDirectorsQuery = `
      SELECT * FROM director ORDER BY director_id;
  `
  const DirectorsArray = await db.all(GetAllDirectorsQuery)
  response.send(
    DirectorsArray.map(eachobj => ConvertDbDirectorToResponseObj(eachobj)),
  )
})

// API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const GetDirectorMoviesQuery = `
      SELECT movie_name FROM movie
      WHERE director_id = ${directorId};
  `
  const DirectorMovieArray = await db.all(GetDirectorMoviesQuery)
  response.send(DirectorMovieArray)
})

module.exports = app
