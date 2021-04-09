const NFA = require('./nfa');

//#region Multi Examples
// let NFAExamples = [
//     [ //Example: 1
//         ['A', 'B', 'C', 'D', 'E'],
//         ['0', '1'],
//         ['E'],
//         `A AB
//         D C
//         E -
//         - E
//         - -`
//     ],
//     [ //Example: 2
//         ['A', 'B', 'C', 'D', 'E', 'F'],
//         ['0', '1', '2'],
//         ['F'],
//         `AB A AC
//         - D -
//         - E -
//         - - F
//         F - -
//         F F F`
//     ],
//     [ //Example: 3
//         ['A', 'B', 'C', 'D', 'E', 'F'],
//         ['a', 'b', 'c', 'd'],
//         ['F'],
//         `B DF C -
//         B DF - -
//         - - F E
//         DF - - -
//         - - F E
//         B DF C -`
//     ],
//     [ //Example: 4
//         ['A', 'B', 'C', 'D', 'E', 'F'],
//         ['a', 'b', 'c', 'd'],
//         ['F'],
//         `B DF C -
//         B DF - -
//         - - F E
//         D - - -
//         - - F E
//         B DF C -`
//     ],
//     [ //Example: 5
//         ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
//         ['0', '1'],
//         ['J'],
//         `BG CH
//         - E
//         F -
//         G H
//         J -
//         - J
//         JD -
//         - JD
//         BG CH`
//     ],
// ];

// let centerText = (text, width, fill = " ") => {
//     width = Math.max(0, width - text.length / 2);
//     let right = parseInt(width / 2);
//     return fill.repeat(width - right) + text + fill.repeat(right);
// }

// for (let i = 0, nfa; i < NFAExamples.length; i++) {
//     console.log(centerText(` EXAMPLE${i + 1} `, 50, "="));
//     nfa = new NFA(...NFAExamples[i]);
//     nfa.print("NFA");

//     var DFAs = nfa.convert2DFA();
//     NFA.prototype.print.call(DFAs[0], ...[['DFA', "Renamed DFA"], [DFAs[1]]]);
//     console.log();
// }
//#endregion

let nfa = new NFA(
    // ['A', 'B', 'C', 'D', 'E'],
    // ['0', '1'],
    // ['E'],
    // `A AB
    // C DE
    // - E
    // E -
    // - -`
    ['A', 'B', 'C', 'D', 'E', 'F'],
    ['a', 'b'],
    ['F'],
    `ab b
    - c
    cd f
    - e
    - c
    - f`
);
nfa.printConsole("NFA");

let DFAs = nfa.convert2DFA();
NFA.prototype.printConsole.call(DFAs[0], ...[['DFA', "Renamed DFA"], [DFAs[1]]]);
