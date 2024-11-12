import * as url from 'url';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import cors from 'cors';
import * as data_provider from './data_provider.js';
import shortuuid from 'short-uuid';
import stringSanitizer from "string-sanitizer";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const games_library = path.join(process.env.GAMES_LIBRARY || (__dirname, 'games_repo'));
console.log(`Using games libray path: ${games_library}`);

var app = express();
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/games', express.static(games_library));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    // Store uploaded files to disk, rather than memory
    useTempFiles : true,
    tempFileDir : './tmp/'
}));

app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'));

app.get('/api/list', async function(req, res, next) {
	var list = JSON.parse(data_provider.read_list());
    res.json(list);
});

app.get('/api/game', async function(req, res, next) {
    if (req.query.gameId) {
        var list = JSON.parse(data_provider.read_list());
        var game = list.filter(function(i) {
            return i.id === req.query.gameId;
        })[0];
        res.json(game);
    }
});

app.post('/api/create', (req, res, next) => {
    console.log('CREATE called');

    if (!req.files || !req.files.file) {
        return res.status(422).send('No files were uploaded');
    }

    var game = getGameFromBody(req.body);
    game.id = shortuuid.generate();
    game.path = stringSanitizer.sanitize.keepNumber(game.name);
    data_provider.save_new_game(games_library, req.files.file, game);
    res.redirect('/settings.html?action=created');
});

app.post('/api/update', (req, res, next) => {
    console.log('UPDATE called');

    var game = getGameFromBody(req.body);
    game.id = req.body.id;
    data_provider.update_game(game);
    res.redirect('/settings.html?action=updated');
});

app.delete('/api/delete', (req, res) => {
    console.log('DELETE called');

    data_provider.delete_game(games_library, req.query.gameId);
    res.json({"success": true});
});

const getGameFromBody = (body) => {
    var game = {};
    game.name = body.name;
    game.img = body.img;
    game.description = body.description;
    game.developers = body.developers;
    game.publishers = body.publishers;
    game.genres = body.genres;
    game.year = body.year;
    game.trailer = body.trailer;
    return game;
};