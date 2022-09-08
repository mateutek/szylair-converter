const yargs =  require('yargs');
const fs =  require('fs');
const { parse } =  require('csv-parse');
const hb =  require('handlebars');

const template = fs.readFileSync('template.hbs','utf-8');

const argv = yargs
    .option('input', {
        alias: 'i',
        description: 'Name of the input file (with .csv extension)',
        type: 'string'
    })
    .help()
    .alias('help', 'h').argv;

const data = [];

function compileTemplate() {
    const compiled = hb.compile(template);
    const html = compiled({data});
    const outputName = argv.input.split('.csv')[0];
    fs.writeFileSync(`${outputName}.html`, html);
}

if (argv.input) {
    if(argv.input.indexOf('.csv') > 0) {
        try {
            fs.createReadStream(`./${argv.input}`)
                .pipe(parse({ delimiter: ";", from_line: 1 }))
                .on("data", row => {
                    const [id,fullName, address, subcontractor, range, category, ...rest] = row
                    if(row.every(value => !!value)) {
                        data.push({id,fullName, address, subcontractor, range, category, other: rest});
                    }
                })
                .on("end", () => {
                    compileTemplate();
                })
                .on("error", error => {
                    console.log(error.message);
                });
        } catch (e) {
            console.error('File does not exist', e);
        }
    } else {
        console.log('File has wrong extension')
    }
}