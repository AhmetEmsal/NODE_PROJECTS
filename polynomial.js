class Polynomial {
    /**
     * @description Constructor of class named Polynomial
     * @param {(String|Uint8Array|Object)} datas - degreeInputs: defination...
     * @throws Will throw an error if the argument isn't correct.
     */
    constructor(datas = null) {
        if (datas == null) {
            this._datas = {}; //Empty polynomial: f(x) = 0
            return;
        }

        let uint8Array;
        if (typeof datas == 'string') { //Binary string
            let bits = datas.split('');
            if (datas == 'Infinity') throw new Error('Infinity cannot be convert into a Polynomial!');
            else if (bits.find(bit => bit != 0 && bit != 1)) throw new Error("Parameter named datas were gived as binary string. But string hadn't only zeros or ones.");
            uint8Array = new Uint8Array(bits);
        }
        else if (datas instanceof Uint8Array) uint8Array = datas;
        else if (typeof datas == 'object') { // Exp: {2:4, 5:-2} => 4x^2 - 2x^5
            if (
                Object.entries(datas)
                    .find(([degree, factor]) => isNaN(degree) || isNaN(factor))
            ) throw new Error(`Parameter named datas were gived as object. But values must be number only!`);
            this._datas = datas;
            return;
        }
        else throw new Error('Paramater named data must be null, String , Uint8Array or Object.');

        this._datas = uint8Array.reverse().reduce((acc, factor, degree) => { //MSB(Most Significant Bit) in far left. Therefore, the array must be reversed.
            if (factor == 1) acc[degree] = 1;
            else if (factor != 0) throw new Error('Bit must be 0 or 1!');
            return acc;
        }, {});
    }

    /**
     * @description Calculates polynomial with given value
     * @param {Number} x - x: input for f(x) 
     * @return {Number} Result of polynomial
     */
    calculate(x) {
        return Object.entries(this._datas).reduce((acc, [degree, factor]) => {
            acc += factor * Math.pow(x, parseInt(degree));
            return acc;
        }, 0) || 0;
    }

    //#region MULTIPLY
    /**
     * @description Calculates the product of multiple polynomials
     * @param {...Polynomial} polynomials - Array of polynomials that are multiplied with each other. Length of array must be at least 2.
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of multipications
     */
    static multiply(...polynomials) {
        if (polynomials.length < 2) throw new Error('Length of polynomials must be bigger than 1!');

        let polyData = polynomials.shift().valueOf(), // Object
            resPolyData = {}, newDegree, newFactor;

        polynomials = polynomials
            .map(p =>
                Object.entries(p.valueOf())
                    .map(([d, f]) => [parseInt(d), f]) //convert sting to integer
            );

        while (1) {
            let poly2Data = polynomials.shift(); //Pop first polynomial from array

            //#region Multiply Two Polynomials
            for (let degree1 in polyData) { //Object| key:degree, value:factor
                let factor1 = polyData[degree1];
                poly2Data.forEach(([degree2, factor2]) => {
                    newFactor = factor1 * factor2;
                    if (newFactor == 0) return true;
                    newDegree = parseInt(degree1) + degree2;
                    if (newDegree in resPolyData) resPolyData[newDegree] += newFactor;
                    else resPolyData[newDegree] = newFactor;
                });
            }
            //#endregion

            if (!polynomials.length) break;

            polyData = Object.assign({}, resPolyData);
            resPolyData = {};
        }
        for (let degree in resPolyData) if (resPolyData[degree] == 0) delete resPolyData[degree]; //Remove degree if it's factor is zero.
        return new Polynomial(resPolyData);
    }

    /**
     * @description Calculates the product of this polynomial and given polynomial(s)
     * @param {...Polynomial} polynomials - Polynomial|Polynomial[]
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of multipications
     */
    multiply(...polynomials) { return this.__proto__.constructor.multiply(this, ...polynomials); }
    //#endregion

    //#region MOD
    /**
     * @description Polynomial mod(2)
     * @param {Polynomial} polynomial - Polynomial
     * @param {Number} [mod=2] - mod
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} result of getting the mod
     */
    static mod(polynomial, mod = 2) {
        let datas = Object.assign({}, polynomial.valueOf());//Copy of polynomial data
        for (let degree in datas) {
            let factor = datas[degree],
                newFactor = factor % mod;
            if (newFactor == 0) delete datas[degree];
            else datas[degree] = newFactor;
        }
        return new Polynomial(datas);
    }
    /**
     * @description Polynomial mod(2)
     * @param {Polynomial} polynomial - Polynomial
     * @param {Number} [mod=2] - mod
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} result of getting the mod
     */
    mod(mod = 2) { return this.__proto__.constructor.mod(this, mod); }
    //#endregion

    //#region SUMMATION
    /**
     * @description Calculates the sum of multiple polynomials
     * @param {...Polynomial} polynomials - Array of polynomials that will be summed with each other. Length of array must be at least 2.
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of summation(s).
     */
    static summation(...polynomials) {
        if (polynomials.length < 2) throw new Error('Length of polynomials must be bigger than 1!');
        polynomials = polynomials.map(p => p.valueOf());

        let resPolyData = Object.assign({}, polynomials.shift()); //Result polynomial's data
        while (polynomials.length) {
            let poly2Data = polynomials.shift(); //Pop first polynomial from array

            //#region Summation Two Polynomials
            for (let degree in poly2Data) {
                if (!(degree in resPolyData)) resPolyData[degree] = 0;
                resPolyData[degree] += poly2Data[degree];
            }
            //#endregion
        }
        for (let degree in resPolyData) if (resPolyData[degree] == 0) delete resPolyData[degree]; //Remove degree if it's factor is zero.
        return new Polynomial(resPolyData);
    }

    /**
     * @description Calculates the sum of this polynomial and given polynomial(s)
     * @param {...Polynomial} polynomials - Polynomial|Polynomial[]
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of summation(s).
     */
    summation(...polynomials) { return this.__proto__.constructor.summation(this, ...polynomials); };
    //#endregion

    //#region SUBTRACTION
    /**
     * @description Calculates the substract of multiple polynomials
     * @param {...Polynomial} polynomials - Array of polynomials that will be summed with each other. Length of array must be at least 2.
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of substraction(s).
     */
    static substraction(...polynomials) {
        if (polynomials.length < 2) throw new Error('Length of polynomials must be bigger than 1!');
        polynomials = polynomials.map(p => p.valueOf());

        let resPolyData = Object.assign({}, polynomials.shift()); //Result polynomial's data
        while (polynomials.length) {
            let poly2Data = polynomials.shift(); //Pop first polynomial from array

            //#region Substraction Two Polynomials
            for (let degree in poly2Data) {
                if (!(degree in resPolyData)) resPolyData[degree] = 0;
                resPolyData[degree] -= poly2Data[degree];
            }
            //#endregion
        }
        for (let degree in resPolyData) if (resPolyData[degree] == 0) delete resPolyData[degree]; //Remove degree if it's factor is zero.
        return new Polynomial(resPolyData);
    }

    /**
     * @description Calculates the substract of this polynomial and given polynomial(s)
     * @param {...Polynomial} polynomials - Polynomial|Polynomial[]
     * @throws Will throw an error if the argument isn't correct.
     * @return {Polynomial} Result polynomial of substraction(s).
     */
    substraction(...polynomials) { return this.__proto__.constructor.substraction(this, ...polynomials); };
    //#endregion

    static reduction(polynomial, irreduciblePoly) {
        let getGreatestDegree = poly => Math.max(...Object.keys(poly));

        //Initial Step
        let resPoly = new Polynomial(Object.assign({}, polynomial.valueOf())); //Copy of polynomial
        let resPolyData = resPoly.valueOf(),
            polyData2 = Object.assign({}, irreduciblePoly.valueOf()); //Copy of polynomial data
        let GD = getGreatestDegree(polyData2);
        delete polyData2[GD];
        irreduciblePoly = new Polynomial(polyData2);

        //Reduction Part
        let GD_2, tempPoly;
        while ((GD_2 = getGreatestDegree(resPolyData)) >= GD) {
            if (GD_2 == GD && resPolyData[GD_2] == 1) tempPoly = irreduciblePoly; //No need to multiply
            else tempPoly = irreduciblePoly.multiply(new Polynomial({ [GD_2 - GD]: resPolyData[GD_2] }));

            delete resPolyData[GD_2]; // Exp: x^4 go away
            resPoly = resPoly.summation(tempPoly);
            resPolyData = resPoly.valueOf();
        }

        return resPoly;
    }
    reduction(irreduciblePoly) { return this.__proto__.constructor.reduction(this, irreduciblePoly); }


}
Polynomial.prototype.toString = function (printFName = true, tab = 0, spaceBtwTerms = true) {
    tab = "\t".repeat(tab);
    let fx = '';
    Object.entries(this._datas).sort((a, b) => b[0] - a[0]).forEach((k, idx) => {
        let degree = parseInt(k[0]),
            factor = k[1],
            negative = factor < 0;
        if (negative) factor *= -1;

        fx +=
            ( //Sign
                idx == 0 ?
                    (negative ? "-" : "") :
                    (negative ? spaceBtwTerms ? " - " : "-" : spaceBtwTerms ? " + " : "+")
            ) +
            ( //Factor
                factor != 1 ?
                    factor :
                    (degree == 0 ? factor : "")
            ) +
            ( //Degree
                degree != 0 ?
                    "x" + (
                        degree != 1 ?
                            displayExponent(degree) :
                            ""
                    ) :
                    ""
            );
    });
    return tab + (printFName ? `f(x)= ` : '') + (fx || 0);
}
Polynomial.prototype.valueOf = function () { return this._datas; }

function displayExponent(n) {
    if (n == 0 || Math.abs(n) == 1) return "";
    let resStr = "";
    if (n < 0) {
        resStr = String.fromCharCode(8315);
        n *= -1;
    }
    let degreeList = [8304, 185, 178, 179, 8308, 8309, 8310, 8311, 8312, 8313].map(n => String.fromCharCode(n));

    n.toString().split('').map(digit => {
        resStr += degreeList[parseInt(digit)];
    })
    return resStr;
};


module.exports = Polynomial;
