let request = require('request-promise');
let fs = require('fs');

let appRoot = __dirname;
let _ = require('lodash');
let Promise = require('bluebird');

let Baby      = require('babyparse');
let jsdom     = require("jsdom");
let { JSDOM } = jsdom;
let jquery    = require('jquery');

let counter = 0;

new Promise(function (resolve, reject) {
    fs.readFile(appRoot.concat('/files/eventsinamerica.txt'), 'utf8', function(err, links) {
        err ? reject(err) : resolve(links.split("\n"));
    });
})
.map(function (link, index) {
    console.log(++counter, index);
    return parse(link);
},
{concurrency: 4}
)
.then(function(data) {
    let csv = Baby.unparse(data);

    fs.writeFile(appRoot.concat('/files/eventsinamerica.csv'), csv, function (err) {
        if (err) return console.log(err);
        console.log("Finish parse!!!");
    });
});


function parse(link) {
    let cookiejar = request.jar();

    let optionsPost = {
        method: 'POST',
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Content-Type": "text/html; charset=UTF-8",
        },
        uri: 'http://www.eventsinamerica.com/login-form-iframe.html',
        form: {
            email: "jeff@easylead.co",
            password: "login12345",
        },
        jar: cookiejar,
        json: false,
        followAllRedirects: true,
    };

    let options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Content-Type": "text/html; charset=UTF-8",
        },
        uri: link,
        jar: cookiejar,
        json: false,
        followAllRedirects: true,
    };

    return request(optionsPost)
        .then(function (pageGet) {
            return request(options).then(function (page) {
                let states = {
                    "Ot": "Non US/Can",
                    "AL": "Alabama",
                    "AK": "Alaska",
                    "AZ": "Arizona",
                    "AR": "Arkansas",
                    "CA": "California",
                    "CO": "Colorado",
                    "CT": "Connecticut",
                    "DE": "Delaware",
                    "DC": "D.C.",
                    "FL": "Florida",
                    "GA": "Georgia",
                    "HI": "Hawaii",
                    "ID": "Idaho",
                    "IL": "Illinois",
                    "IN": "Indiana",
                    "IA": "Iowa",
                    "KS": "Kansas",
                    "KY": "Kentucky",
                    "LA": "Louisiana",
                    "ME": "Maine",
                    "MD": "Maryland",
                    "MA": "Massachusetts",
                    "MI": "Michigan",
                    "MN": "Minnesota",
                    "MS": "Mississippi",
                    "MO": "Missouri",
                    "MT": "Montana",
                    "NE": "Nebraska",
                    "NV": "Nevada",
                    "NH": "New Hampshire",
                    "NJ": "New Jersey",
                    "NM": "New Mexico",
                    "NY": "New York",
                    "NC": "North Carolina",
                    "ND": "North Dakota",
                    "OH": "Ohio",
                    "OK": "Oklahoma",
                    "OR": "Oregon",
                    "PA": "Pennsylvania",
                    "PR": "Puerto Rico",
                    "RI": "Rhode Island",
                    "SC": "South Carolina",
                    "SD": "South Dakota",
                    "TN": "Tennessee",
                    "TX": "Texas",
                    "UT": "Utah",
                    "VT": "Vermont",
                    "VA": "Virginia",
                    "WA": "Washington",
                    "WV": "West Virginia",
                    "WI": "Wisconsin",
                    "WY": "Wyoming",
                    "AB": "Alberta",
                    "BC": "British Columbia",
                    "MB": "Manitoba",
                    "NB": "New Brunswick",
                    "NL": "Newfoundland and Labrador",
                    "NS": "Nova Scotia",
                    "ON": "Ontario",
                    "PE": "Prince Edward Island",
                    "QC": "Quebec",
                    "SK": "Saskatchewan",
                };

                let json = {
                    "URL": options.uri,
                    "Event_Name": null,
                    "Dates": null,
                    "Attendees": null,
                    "Exhibitors": null,
                    "Event_Description": null,
                    "Address": null,
                    "City": null,
                    "State": null,
                    "Zip_Code": null,
                    "Primary_Industry": null,
                };

                let { window } = new JSDOM(page);
                let $ = jquery(window);
                let dates = '';
                let Other_Industry = $(".p-eventdet-cont .p-eventdet-out").eq(1).find("div").last().text().split(",");
                let event_contact = $("#event-contacts").find(".alignleft").not(".email-link");
                let Event_Description = $(".p-intro").find("#event-description").first().text();
                Event_Description = replaceAll(Event_Description, "\n", "");
                Event_Description = replaceAll(Event_Description, "\t", "");
                Event_Description = replaceAll(Event_Description, "\r", "");
                let name = '';
                let address = '';
                let temp = '';
                let phone = $(event_contact[0]).find(".phone-link").text().trim();

                dates += $(".profile-content-left .p-calendar.org table").find("span").first().text() + ' ';
                dates += $(".profile-content-left").find(".p-title2").first().text() + ' - ';
                dates += $(".profile-content-left .p-calendar table").find("span").last().text() + ' ';
                dates += $(".profile-content-left").find(".p-title2").last().text();

                json.Event_Name = $(".profile-content-right-a").find("h1").last().text();
                json.Dates = dates;
                json.Attendees = $(".pis2").text().trim();
                json.Exhibitors = parseInt($(".pis3").text().trim().split('+')[0], 10) || 0;
                json.Event_Description = Event_Description;

                address = event_contact[0];
                $(address).find("a, br").remove();

                if (!_.isEmpty(address)) {
                    address = $(address).text().trim().split("\n");
                    address = address[$(address).length - 1];
                    temp = address.trim().split(",");

                    json.City = temp[0];

                    temp = temp[1];

                    if (!_.isEmpty(temp)) {
                        json.State = states[temp.trim().split(" ")[0]];
                        json.Zip_Code = temp.trim().split(" ")[1];
                    }
                }

                _.forEach(event_contact, function(value, key) {
                    address = $(value).find(".phone-link").text().trim();

                    $(value).find("a, br").remove();

                    if (key == 0) {
                        name = $(value).text().split("\n")[0].trim();
                        address = phone;
                    } else {
                        name = $(value).text().trim();
                    }

                    name = replaceAll(name, "\n", "");
                    name = replaceAll(name, "\t", "");
                    name = replaceAll(name, "\r", "");

                    json['Event_Contact_' + (key + 1) + '_Name'] = name;
                    json['Event_Contact_' + (key + 1) + '_Phone_Number'] = address;
                });

                json.Primary_Industry = $(".p-eventdet-cont .p-eventdet-out:first").find("div").last().text().trim();

                _.forEach(Other_Industry, function(value, key) {
                    json['Other_Industry_' + (key + 1)] = _.trim(value);
                });

                json.Show_Owner = $(".p-eventdet-cont .p-eventdet2 .p-eventdet-out:first").find("span").text().trim();

                return json;
            });
        })
        .catch(function (err) {
            console.log(err);
            return {};
        });
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}