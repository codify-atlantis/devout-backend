'use strict'
const fs = require('fs');
const { XMLParser } = require("fast-xml-parser");
const axios = require('axios').default;
const cheerio = require('cheerio');

const newsRssFeeds = {
    general: "https://www.catholicnewsagency.com/rss/news.xml",
    usa: "https://www.catholicnewsagency.com/rss/news-us.xml",
    vatican: "https://www.catholicnewsagency.com/rss/news-vatican.xml",
    americas: "https://www.catholicnewsagency.com/rss/news-americas.xml",
    europe: "https://www.catholicnewsagency.com/rss/news-europe.xml",
    asiaPacific: "https://www.catholicnewsagency.com/rss/news-asia.xml",
    africaMiddleEast: "https://www.catholicnewsagency.com/rss/news-middleeast.xml"
}


module.exports = (req, res) => {
    // download xml from cna
    let feed = req.body.feed || 'general';
    if (!Object.keys(newsRssFeeds).includes(feed))
        return res.status(400)
            .send(
                {
                    message: "Invalid value passed to param(feed)! Please try one of the following: 'general', 'usa', 'vatican', 'americas', 'europe', 'asiaPacific', 'africaMiddleEast'"
                }
            );

    axios.get(newsRssFeeds[feed])
        .then(rssFormatedResponse => {
            // convert xml to js object
            const parser = new XMLParser();
            let parsedXML = parser.parse(rssFormatedResponse.data);
            let response = []
            // filter the object to return
            parsedXML.rss.channel.item.map(news => {
                const $ = cheerio.load(news.description.replace(/(\r\n|\n|\r)/gm, ""));
                let result = {
                    title: news.title.trim(),
                    category: news.category,
                    imageURL: $('div img').attr('src') || '',
                    link: news.link,
                    description: {
                        header: $('div span').text().trim() || '',
                        info: $('p:nth-child(2)').text().trim() || '',
                        guid: news.guid,
                        datePublished: news.pubDate,
                        content: {
                            p1: $('p:nth-child(3)').text().trim() || '',
                            p2: $('p:nth-child(4)').text().trim() || '',
                            p3: $('p:nth-child(5)').text().trim() || '',
                        },
                    },
                };
                response.push(result);
            });

            // send the news retrieved from the feed
            return res.send(JSON.stringify(response));
        })
        .catch(err => res.status(500).send({ error: err.message }))
}
