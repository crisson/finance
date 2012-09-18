// Open Source Initiative OSI - The MIT License (MIT):Licensing
// 
// The MIT License (MIT)
// Copyright (c) 2012 Crisson Jno-Charles & Alisa Boguslavskaya
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function reduce(accumulator){
    if (this===null || this===undefined) throw new TypeError("Object is null or undefined");
    var i = 0, l = this.length >> 0, curr;

    if(typeof accumulator !== "function") // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
      throw new TypeError("First argument is not callable");

    if(arguments.length < 2) {
      if (l === 0) throw new TypeError("Array length is 0 and no second argument");
      curr = this[0];
      i = 1; // start accumulating at the second element
    }
    else
      curr = arguments[1];

    while (i < l) {
      if(i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
      ++i;
    }

    return curr;
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while(k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };      
}


var Finance = (function(Finance){
  var fin = Finance || {};
  var inp = {};
  
  function DependencyError(message){
    this.name = 'DependencyError';
    this.message = message || 'A required dependency was not found';
  }
  
  DependencyError.prototype = new Error();
  DependencyError.prototype.constructor = DependencyError;  
  
  /*
   * Cumulative Distribution Function for a discrete distribution of random
   * variables
   * 
   * @this {Finance.input}
   * @param {Array} x an array representing the number of measurements
   * @param {Array} fx an array of the random variables measured
   * @param {Map} options flags
   *
   * @throws {TypeError} if x or y is not an Array
   */
  inp.cdf_discrete = function(x, fx, options){
    if (!(x instanceof Array)) {
      throw new TypeError('x must be an array');
    } else if (!(fx instanceof Array)){
      throw new TypeError('fx must be an array');
    }
    
    if (x.length !== fx.length){
      throw new RangeError('the errors must be the same length');
    }
    
    var cdf = x.map(function(val, ind, arry){
      var obj = {};
      obj[ind] = fx.reduce(function(prev, cond, indr){
        if (indr <= ind){
          return prev + cond;
        }
        
        return prev;
      }, 0);
      
      return obj;
    });
    
    if (options && !options.pair) { // return just the values as an array
      return cdf.map(function(pair, ind){
        return pair[ind];
      });
    }
    
    return cdf;
  };
  
  /*
   * Returns pairs of coordinates for the standard normal distribution if the
   * value provided for x is an Array or object containing the number of pairs
   * that should be returned.  If x is a number, it returns an approximate value
   * of this distribution at that number (i.e., f(x)).
   *
   * @param {Number | Object} x either the value of this function at this x
   * coordinate, or if it is an object, the number of points in x for which.
   * You may also provide an array of values for which f(x) should be computed
   * f(x) shoule be calculated
   * @param {object} options optional properties
   *
   * @return {Either[Number, Object]} coordinates if param x is an array or
   * object, otherwise a number
   *
   * @throws {Error} if an object is passed for x, but it doesn't contain the
   * property range, which indicates the number of values x for which f(x)
   * should be calculated
   * @throws {Error} if an object is passed for x, but the range property
   * provided is less than or equal to zero.
   */
  inp.stdnormal = function(x, options){
    if (typeof x !== 'number' && !(x instanceof Array)) {
      if (!x.range) {
        throw new Error('this is an object, so you must specify the number of' +
        ' points in the domain');
      } else if (x.range && x.range <= 0) {
        throw new Error('the number of data points must be greater than zero');
      }
    }
    options = options || {};
    var rho_sqr = options.rho_sqr = options.rho_sqr || 1,
      mu = options.mu = options.mu || 0;

    function calculate(x_val){
      return 1/(Math.sqrt(rho_sqr)*Math.sqrt(2 * Math.PI))*Math.pow(Math.E,
       -Math.pow(x_val - mu, 2)/2*rho_sqr);
    }
    
    if (x instanceof Array){
      return x.map(function(val, ind){
        return [ind, calculate(val)];
      });
    } else if (x.range){
      var pairs = [];
      for (var i = 0; i < x.range; i++){
         pairs.push([i, calculate(i)]);
      }
      return pairs;
    } else {
      return calculate(x);
    }
  };
  
  fin.inputs = inp;
  return fin;
}(Finance));