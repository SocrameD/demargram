var express = require('express')
var path = require('path')
var logger = require('morgan')
var bodyParser = require('body-parser')
var neo4j = require('neo4j-driver')
const {
    v4: uuid,
} = require('uuid')

var app = express()

// View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

var driver = neo4j.driver('neo4j://localhost', neo4j.auth.basic('neo4j', '12345678'))

var session = driver.session()

app.get('/', (req, res) => {
    session.run('MATCH(n:pessoas) RETURN n LIMIT 25').
        then(result => {
            const listaPessoas = []
            result.records.forEach(record => {
                
                //console.log(record._fields[0].properties)
                const { uuid, nome, localizacao, idade } = record._fields[0].properties
                listaPessoas.push({
                    id: uuid, nome, localizacao, idade: idade.low 
                })
            })
            //res.send(listaPessoas)
            res.render('index', {
                listaPessoas
            })
        }).catch(err =>
            console.log(err)
        )
})

app.get('/save', (req, res) => {

    const pessoa = ` {uuid:"${uuid()}", nome:"Gabriel Jesus", idade:26, localizacao: "Rio Verde - GO"}`
    const pessoa2 = ` {uuid:"${uuid()}", nome:"Alan Demarcos", idade:32, localizacao: "Ubatuba - SP"}`
    const pessoa3 = ` {uuid:"${uuid()}", nome:"Gabriel Jesus", idade:26, localizacao: "Rio Verde - GO"}`

    session.run(`create (a:pessoas ${pessoa2})`)
    .then((result) => {
        res.send(result)
    })

})

app.get('/relacao', (req, res) => {

    //A primeira pessoa tem relação com a segunda 
    //ou seja vai ter so uma seta indo
 
    var idPessoa = "5ca2c479-f39c-494c-b453-d3ac9092fa54"
    var idPessoa2 = "c9d1ad22-0e05-443d-b162-62ca06d5b155"
    var tipoDaRelacao = "Amigo"
    session.run(`MATCH (a:pessoas),(b:pessoas)  where a.uuid = "${idPessoa}" and b.uuid = "${idPessoa2}"
    CREATE (a)-[:${tipoDaRelacao}]->(b) 
     RETURN a,b `)
     .then((result) => {
        res.send(result)
    })


})
app.get('/listar_relacao', (req, res) => {

    var idPessoa = "5ca2c479-f39c-494c-b453-d3ac9092fa54"
    var tipoDaRelacao = "Amigo"
    session.run(`MATCH (a:pessoas {uuid: "${idPessoa}"})-[r:${tipoDaRelacao}]->(b:pessoas)
    RETURN a,b`)
    .then(result => {
        res.send(result)
    })


})

app.listen(3000)
console.log('Server Started on Port 3000')

module.exports = app