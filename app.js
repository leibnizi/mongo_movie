var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
// underscore实现map filter 函数方法
var _ = require('underscore')
// body-parser 它用于解析客户端请求的body中的内容,内部使用JSON编码处理,url编码处理以及对于文件的上传处理
var bodyParser = require('body-parser')
var Movie = require('./models/movie')
var port = process.env.PORT || 3002
var app = express()

mongoose.connect('mongodb://localhost:27017/wuch',{useMongoClient: true})

app.set('views','./views/pages')
app.set('view engine', 'jade')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.locals.moment = require('moment')
app.listen(port)

console.log('node start on port' + port)

// index page
app.get('/', function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err)
        }
        res.render('index', {
            title: '爱电影 home page',
            movies: movies
        })
        // res.send({ some: 'json' });
    })
})

// admin update movie
app.get('/admin/update/:id', function(req, res) {
    var id = req.params.id

    if(id) {
        Movie.findById(id, function(err, mov) {
            if(err) {
                console.log(err)
            }
            res.render('admin', {
                title: '爱电影 后台更新页',
                movie: mov
            })
        })
    }
})

//admin movie
app.get('/admin/movie', function(req, res) {
    res.render('admin', {
        title:'后台录入页面',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            summary: '',
            flash: '',
            language: ''
        }
    })
})

//admin post movie
app.post('/admin/movie/new', function(req, res) {
    var id = req.body.movie._id
    var movieObj = req.body.movie
    var _movie

    if (id !== 'undefined') {
        Movie.findById(id, function(err, movie) {
            if(err) {
                console.log(err)
            }

            _movie = _.extend(movie, movieObj)
            _movie.save(function(err, movie) {
                if(err) {
                    console.log(err)
                }
                res.redirect('/movie/' + movie._id)
            })
        })
    }
    else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        })

        _movie.save(function(err, movie) {
            if(err) {
                console.log(err)
            }
            res.redirect('/movie/' + movie._id)
        })
    }
})

// list page
app.get('/admin/list', function(req, res) {
    Movie.fetch(function(err, movies) {
        if(err) {
            console.log('listPage', err)
        }
        res.render('list', {
            title: '爱电影列表页',
            movies: movies
        })
    })
})

// detail page
app.get('/movie/:id', function(req, res) {
    var id = req.params.id

    Movie.findById(id, function(err, movie){
        res.render('detail', {
            title: '爱电影 ' + movie.title,
            movie: movie
        })
    })
})

//list delete movie
app.delete('/admin/list', function(req, res) {
    var id = req.query.id

    if(id) {
        Movie.remove({_id: id}, function(err, movie) {
            if(err) {
                console.log(err)
            }
            else {
                res.json({success: 1})
            }
        })
    }
})


