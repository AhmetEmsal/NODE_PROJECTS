
const assert = require('assert');
const Polynomial = require('./polynomial');


describe('Polynomial', function () {
    describe('constructor data', function () {
        it('is null', function () {
            assert.strictEqual(new Polynomial().toString(false), "0");
            assert.strictEqual(new Polynomial(null).toString(false), "0");
        });

        it('is object', function () {
            assert.strictEqual(new Polynomial({ 0: 0 }).toString(false), "0");
            assert.strictEqual(new Polynomial({ 0: 1 }).toString(false), "1");
            assert.strictEqual(new Polynomial({ 1: 1 }).toString(false), "x");
            assert.strictEqual(new Polynomial({ 1: 1, 0: 1 }).toString(false), "x + 1");
        })

        it('is binary string', function () {
            assert.strictEqual(new Polynomial("0").toString(false), "0");
            assert.strictEqual(new Polynomial("1").toString(false), "1");
            assert.strictEqual(new Polynomial("10").toString(false), "x");
            assert.strictEqual(new Polynomial("11").toString(false), "x + 1");
        })

        it('is Uint8Array', function () {
            assert.strictEqual(new Polynomial(new Uint8Array([0])).toString(false), "0");
            assert.strictEqual(new Polynomial(new Uint8Array([1])).toString(false), "1");
            assert.strictEqual(new Polynomial(new Uint8Array([1, 0])).toString(false), "x");
            assert.strictEqual(new Polynomial(new Uint8Array([1, 1])).toString(false), "x + 1");
        })

    });

    describe('#.toString()', function () {
        it('exp 1', function () {
            assert.strictEqual(
                (new Polynomial({ 0: 1, 4: 2, 2: 3, 10: 2 })).toString(false),
                '2x¹⁰ + 2x⁴ + 3x² + 1'
            );
        });

        it('exp 2', function () {
            assert.strictEqual(
                (new Polynomial({ 2: 1, 3: -2, 1: 4, 10: -1 })).toString(false),
                '-x¹⁰ - 2x³ + x² + 4x'
            );
        });
    })

    describe('summation method', function () {

        it('via instance', function () {
            assert.strictEqual((new Polynomial()).summation(new Polynomial()).toString(false), "0");
            assert.strictEqual((new Polynomial("1")).summation(new Polynomial()).toString(false), "1");
            assert.strictEqual(
                (new Polynomial({ 0: 1, 4: 2, 2: 3, 10: 2 })) // 2x¹⁰ + 2x⁴ + 3x² + 1
                    .summation(
                        new Polynomial({ 2: 1, 3: -2, 1: 4, 10: -1 }) // -x¹⁰ -2x³ + x² + 4x
                    ).toString(false)
                ,
                "x¹⁰ + 2x⁴ - 2x³ + 4x² + 4x + 1"
            );
        });

        it('via static', function () {
            assert.strictEqual(Polynomial.summation(new Polynomial(), new Polynomial()).toString(false), "0");
            assert.strictEqual(Polynomial.summation(new Polynomial("1"), new Polynomial()).toString(false), "1");
        });
    });

    describe('substraction method', function () {

        it('via instance', function () {
            assert.strictEqual((new Polynomial()).substraction(new Polynomial()).toString(false), "0");
            assert.strictEqual((new Polynomial()).substraction(new Polynomial("1")).toString(false), "-1");
            assert.strictEqual(
                (new Polynomial({ 0: 1, 4: 2, 2: 3, 10: 2 })) // 2x¹⁰ + 2x⁴ + 3x² + 1
                    .substraction(
                        new Polynomial({ 2: 1, 3: -2, 1: 4, 10: -1 }) // -x¹⁰ -2x³ + x² + 4x
                    ).toString(false)
                ,
                "3x¹⁰ + 2x⁴ + 2x³ + 2x² - 4x + 1"
            );
        });

        it('via static', function () {
            assert.strictEqual(Polynomial.substraction(new Polynomial(), new Polynomial()).toString(false), "0");
            assert.strictEqual(Polynomial.substraction(new Polynomial(), new Polynomial("1")).toString(false), "-1");
        });
    });

    describe('mod method', function () {

        it('exp 1', function () {
            assert.strictEqual(
                (new Polynomial({ 0: 1, 4: 2, 2: 3, 10: 2 })) // 2x^1⁰ + 2x^4 + 3x^2 + 1
                    .mod(2)
                    .toString(false),
                "x² + 1"
            );
        });

    });

    describe('reduction method', function () {

        it('exp 1', function () {
            assert.strictEqual(
                (new Polynomial({ 3: 1 }))
                    .reduction(new Polynomial({ 4: 1, 1: 1, 0: 1 }))
                    .toString(false),
                "x³"
            );
        });

        it('exp 2', function () {
            assert.strictEqual(
                (new Polynomial({ 4: 1, 3: 1, 2: 1, 1: 1, 0: 2 }))
                    .reduction(new Polynomial({ 4: 1, 1: 1, 0: 1 }))
                    .toString(false),
                "x³ + x² + 2x + 3"
            );
        });

        it('exp 2', function () {
            assert.strictEqual(
                (new Polynomial({ 10: 1 }))
                    .reduction(new Polynomial({ 4: 1, 1: 1, 0: 1 }))
                    .toString(false),
                "2x³ + x² + x + 1"
            );
        });

        it('exp 3', function () {
            assert.strictEqual(
                (new Polynomial({ 3: 1, 2: 1 }))
                    .multiply(new Polynomial({ 3: 1 }))
                    .reduction(new Polynomial({ 4: 1, 1: 1, 0: 1 }))
                    .toString(false),
                "x³ + 2x² + x"
            );
        });

    });

    describe('multiply method', function () {

        it('exp 1', function () {
            assert.strictEqual(
                (new Polynomial({ 2: 3, 3: 7, 1: -16, 0: 3 }))
                    .multiply(new Polynomial({ 2: -5, 9: 3, 0: -19 }))
                    .toString(false),
                "21x¹² + 9x¹¹ - 48x¹⁰ + 9x⁹ - 35x⁵ - 15x⁴ - 53x³ - 72x² + 304x - 57"
            );
        });

    });

    describe('mixed', function () {
        it('exp 1', function () {
            assert.strictEqual(
                (new Polynomial({ 2: 3, 3: 7, 1: -16, 0: 3 }))
                    .multiply(new Polynomial({ 2: -5, 9: 3, 0: -19 }), new Polynomial({ 1: 1 }), new Polynomial({ 0: 1 }))
                    .substraction({ 6: -35, 2: 302 })
                    .summation({ 4: 1, 5: 12, 6: -2, 2: 5 })
                    .mod(5)
                    .toString(false),
                "x¹³ + 4x¹² - 3x¹¹ + 4x¹⁰ - 2x⁶ - 3x⁵ - 2x⁴ - 2x³ + 2x² - 2x"
            );
        });
    });
})
