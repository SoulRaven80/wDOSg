import igdb from 'igdb-api-node';

export async function searchGame(name) {
    const response = await igdb.default('1phpruda4hrkw3wlxq2gxsq6z71cs7', '2zwakk1rsc8vi8pkaul2k6d3vcczmr')
        .fields('category,cover.image_id,first_release_date,genres.name,involved_companies.id,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,name,platforms.name,screenshots.image_id,status,summary,url,videos.name,videos.video_id')
        .limit(50)
        .search(name)
        .where('release_dates.platform = (13)') // filter the results by DOS
        .request('/games');
    // where release_dates.platform = (6);

    var result = response.data.filter(function(i) {
        // console.log(JSON.stringify(i, null, 4));
        const release = (i.first_release_date !== undefined && i.first_release_date !== null); // has been released
        return release;
    });
    return result;
}

export async function getGameMetadata(gameId) {
    const response = await igdb.default('1phpruda4hrkw3wlxq2gxsq6z71cs7', '2zwakk1rsc8vi8pkaul2k6d3vcczmr')
        .fields('*')
        .limit(1)
        .search(`id = ${gameId}`)
        .request('/games');
    
    // console.log(JSON.stringify(response.data, null, 4));
    return response.data;
}

export async function findCoverId(gameId) {
    const response = await igdb.default('1phpruda4hrkw3wlxq2gxsq6z71cs7', '2zwakk1rsc8vi8pkaul2k6d3vcczmr')
        .fields('*') // fetches only the name, movies, and age fields
        .limit(1) // limit to 50 results
        .where(`game = ${gameId}`) // filter the results
        .request('/covers'); // execute the query and return a response object
    // console.log(response.data);
  return response.data[0].image_id;
}

export default searchGame;