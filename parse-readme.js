const fs = require('fs');
const path = require('path');

/*
    If you're trying to understand this hack, I feel sorry for you. - Author
*/

const PATH_README = path.resolve(__dirname, 'README.md');
const PATH_CODE = path.resolve(__dirname, 'javascript/');

const REGEX_QUESTION_NUMBER = /^\s*######\s*(\d+)/;
const REGEX_CODE_START = /^\s*```(javascript|js|html)/i;
const REGEX_CODE_END = /^\s*```\s*$/;

const FILE_EXTENSIONS = {
    javascript: 'js',
    js: 'js',
    html: 'html',
}

if (!fs.existsSync(PATH_CODE)) {
    fs.mkdirSync(PATH_CODE);
}

function run() {
    const readme = fs.readFileSync(PATH_README, 'utf-8');
    const readmeLines = readme.split('\n');

    let questionNumber = null;

    let codeType = null;
    let javaScriptLines = [];

    let stats = {
        createdFiles: 0,
        questionCount: 0,
        javaScriptLinesCount: 0,
        skippedQuestions: [],
        skippedCodeBlocks: [],
    };

    for (let index = 0; index < readmeLines.length; index++) {
        const line = readmeLines[index];

        if (codeType) {
            if (line.match(REGEX_CODE_END)) {
                const fileName = path.join(PATH_CODE, `${String(questionNumber).padStart(3, '0')}.${FILE_EXTENSIONS[codeType] || 'txt'}`);
                fs.writeFileSync(fileName, javaScriptLines.join('\n') + '\n');
                stats.createdFiles++;

                stats.javaScriptLinesCount += javaScriptLines.length;
                javaScriptLines = [];
                questionNumber = null;
                codeType = null;
            } else if (questionNumber) {
                javaScriptLines.push(line);
            }
        } else {
            const questionNumberMatch = line.match(REGEX_QUESTION_NUMBER);
            if (questionNumberMatch !== null) {
                if (questionNumber) {
                    stats.skippedQuestions.push(`${questionNumber} (@${index})`);
                }
                questionNumber = +questionNumberMatch[1];
                stats.questionCount++;
            } else {
                const codeTypeMatch = line.match(REGEX_CODE_START);
                if (codeTypeMatch !== null) {
                    if (questionNumber) {
                        codeType = codeTypeMatch[1].toLowerCase();
                    } else {
                        stats.skippedCodeBlocks.push(`${codeTypeMatch[1]} (@${index})`);
                    }
                }
            }
        }
    }

    console.log(JSON.stringify(stats, null, 4));
}

run();
