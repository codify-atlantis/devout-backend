const { google } = require('googleapis');
const customsearch = google.customsearch('v1');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CUSTOM_SEARCH_ENGINE_ID = process.env.CUSTOM_SEARCH_ENGINE_ID;
require('dotenv').config();

module.exports = (req, res, next) => {
    let searchTerm = req.body.searchTerm;
    if (!searchTerm)
        return res.status(400)
            .send({
                error: 'Required param (searchTerm) is missing'
            })

    searchTerm = searchTerm.trim();

    let response = [];
    customsearch.cse.list({
        q: searchTerm,
        cx: CUSTOM_SEARCH_ENGINE_ID,
        auth: GOOGLE_API_KEY,
    }).then((searchResults) => {
        if (searchResults.data.items)
            searchResults.data.items.map(item => {
                let filteredResult = {
                    title: item?.title || "",
                    htmlTitle: item?.htmlTitle || "",
                    link: item?.link || "",
                    snippet: item?.snippet || "",
                    image: item?.pagemap?.cse_image || [],
                    htmlSnippet: item?.htmlSnippet || "",
                    thumbnail: item?.pagemap?.cse_thumbnail || [],
                    extract: item?.pagemap["metatags"][0]["og:description"] || "",
                }
                response.push(filteredResult);
            });
    })
        .then((searchResults) => res.status(200).send(response))
        .catch(err => res.status(500)
            .send({
                error: err.message
            }))
}