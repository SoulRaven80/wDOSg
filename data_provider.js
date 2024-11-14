import fs from 'fs';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export function getGenres() {
  try {
    const data = fs.readFileSync( __dirname + "/public/genres.json", 'utf8');
    return data;
  } catch (err) {
    console.error(err);
  }
}

export function read_list() {
    try {
      const data = fs.readFileSync( __dirname + "/public/data.json", 'utf8');
      return data;
    } catch (err) {
      console.error(err);
    }
}

export function save_new_game(gamesLibrary, file, game) {
    try {
      const data = JSON.parse(read_list());
      fs.mkdirSync(`${gamesLibrary}/${game.path}`);
      file.mv(`${gamesLibrary}/${game.path}/bundle.jsdos`);
      fs.copyFileSync(__dirname + '/public/bundle_template/index.html', `${gamesLibrary}/${game.path}/index.html`);
      data[data.length] = game;
      write_list(data);
    } catch (err) {
      console.error(err);
    }
}

export function update_game(game) {
  try {
    const data = JSON.parse(read_list());
    var index = data.findIndex(function(item, i) {
      return item.id === game.id;
    });

    data[index] = game;
    write_list(data);
  } catch (err) {
    console.error(err);
  }
}

export function delete_game(gamesLibrary, gameId) {
  try {
    const data = JSON.parse(read_list());
    var index = data.findIndex(function(item, i) {
      return item.id == gameId;
    });
    
    if (index !== -1) {
      var game = data[index];
      data.splice(index, 1);
      write_list(data);
      fs.rmSync(`${gamesLibrary}/${game.path}`, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(err);
  }
}

export function write_list(data) {
    try {
      fs.writeFileSync( __dirname + "/public/data.json", JSON.stringify(data, null, 4));
    } catch (err) {
      console.error(err);
    }
}

export default read_list;