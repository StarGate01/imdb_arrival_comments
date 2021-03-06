var cheerio = require('cheerio');
var fs = require('fs');
var excelbuilder = require('msexcel-builder');

fs.existsSync("./result") || fs.mkdirSync("./result");
var workbook = excelbuilder.createWorkbook('./result', 'arrival_imdb_comments.xlsx')
var sheet1 = workbook.createSheet('Arrival', 7, 1032);

var header = ["date", "ratingPercent", "usefulPercent", "author", "from", "title", "text"];
for(var k = 0; k < header.length; k++) sheet1.set(k + 1, 1, header[k]);

var rowNumber = 0;
for (var i = 0; i < 103; i++)
{
    var htmlString = fs.readFileSync("data/" + i + ".html", 'utf8');
    console.log("Read file #" + i);

    var $ = cheerio.load(htmlString);
    console.log("Loaded file #" + i);

    var content = $("#tn15content").first().html();
    var cparts = content.split(/<hr.+>/);
    for(var j=1; j<cparts.length-3; j++) 
    {
        var $ = cheerio.load(cparts[j]);
        var meta = $("div");
        var text = $("p").text().replace("*** This review may contain spoilers ***", "");
        var title = meta.children("h2").first().text();
        var usefulParts = meta.children("small").eq(0).text().split(" ");
        var usefulPercent = (parseInt(usefulParts[0]) / parseInt(usefulParts[3])) * 100;
        var ratingPercent = -1;
        if(meta.children("img").length > 0)
        {
            var ratingParts = meta.children("img").first().attr("alt").split("/");
            ratingPercent = (parseInt(ratingParts[0]) / parseInt(ratingParts[1])) * 100;
        }
        var fromParts = meta.children("small").eq(1).text().split(" ");
        var from = "";
        if(fromParts[0] == "from") {
            fromParts.shift();
            from = fromParts.join(" ");
        }
        var dateText = meta.children("small").last().text();
        var dateParts = dateText.split(" ");
        var day = parseInt(dateParts[0]);
        var year = parseInt(dateParts[2]);
        var month = (new Date(Date.parse(dateParts[1] +" 1, 2012"))).getMonth() + 1;
        var author = meta.children("a").last().text();
        var cleanr = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/gi;
        var entry = [year + "-" + month + "-" + day, ratingPercent.toString().replace(".", ","), 
            usefulPercent.toString().replace(".", ","), author.replace(cleanr, ""), from.replace(cleanr, ""), title.replace(cleanr, ""), text.replace(cleanr, "")];
        for(var k = 0; k < entry.length; k++) sheet1.set(k + 1, rowNumber + 2, entry[k]);
        console.log("Extraced comment #" + j + " from file #" + i + " (comment #" + rowNumber + ")");
        rowNumber++;
    }
    console.log("Parsed file #" + i);

}
workbook.save(function(err){
    if (err) console.log("Error " + err);
    else console.log("Done");
});